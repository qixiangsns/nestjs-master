import { Injectable, Logger } from '@nestjs/common';
import pLimit, { LimitFunction } from 'p-limit';
import { RouteType } from '../models/viber-route-config.model';
import { Consumer } from 'pulsar-client';
import { Pacer } from '@framework/utils/pacer.utils';
import { ViberProviderCode } from '../models/viber-provider.model';
import { type ViberAccountSender } from '../models/viber-account.model';
import { Client, Message } from 'pulsar-client';
import { ViberLogDispatcher } from '../queues/viber-log.dispatcher';
import { type ViberSender } from '../ports/viber-sender.port';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import { getViberRouteTopic } from '../queues/viber-message.queues';
import waitFor, { TimeoutError } from 'p-wait-for';
import { ViberRequest } from '../models/viber-message.model';
import { SendViberResult } from '../models/viber-message.model';
import { LimiterService } from '@application/modules/limiter';

type BatchOptions = {
  maxNumMessages: number;
  timeoutMs: number;
};

const RoutePriority: RouteType[] = ['Otp', 'Notif', 'Mkt'] as const;
type BatchResult = { retryAfterMs: number; batchMessages: Message[] };
type ReceivedMessage = { consumer: Consumer; message: Message };

@Injectable()
export class ViberAccountWorker {
  private logger = new Logger(ViberAccountWorker.name);
  private concurrency: LimitFunction;
  private state: 'paused' | 'running' | 'connected';
  private isProcessing: boolean;
  private consumers: Map<RouteType, Consumer> = new Map();
  private pacer: Pacer;
  private bufferedMessage: ReceivedMessage | null ;

  constructor(
    private readonly providerCode: ViberProviderCode,
    private readonly account: ViberAccountSender,
    private readonly pulsarClient: Client,
    private readonly logDispatcher: ViberLogDispatcher,
    private readonly sender: ViberSender,
    private readonly limiter: LimiterService,
  ) {
    this.pacer = new Pacer({
      maxDelayMs: 2000,
      minDelayMs: 0,
      initialBackoffMs: 100,
      backoffFactor: 2,
    });

    this.concurrency = pLimit(50);
  }

  private async consumeBatch(options: BatchOptions): Promise<BatchResult> {
    let priority = 0;

    const lastPriority = RoutePriority.length - 1;
    const peekTimeoutMs = 50;
    const deadline = addMilliseconds(Date.now(), options.timeoutMs);
    const batchMessages: Message[] = [];

    // Max number messages consumed
    while (batchMessages.length < options.maxNumMessages) {
      const remainingMs = differenceInMilliseconds(deadline, Date.now());
      // Timeout hit
      if (remainingMs < 0) break;

      try {
        const received = this.takeBufferedMessage() ?? (await this.receive(priority, peekTimeoutMs));
        if (!received) continue;

        const { allowed, retryAfterMs } = await this.limiter.acquire(this.account.limiterPoolId);
        if (!allowed) {
          this.bufferedMessage = received;
          return { batchMessages, retryAfterMs };
        }

        await received.consumer.acknowledge(received.message);
        batchMessages.push(received.message);

        if (retryAfterMs > 0) return { batchMessages, retryAfterMs };
      } catch (error) {
        // When queue is drained, priority moves to the lower ones
        priority = priority === lastPriority ? 0 : priority + 1;
      }
    }

    return { retryAfterMs: 0, batchMessages };
  }

  private takeBufferedMessage() {
    const buffered = this.bufferedMessage;
    this.bufferedMessage = null;
    return buffered;
  }

  private async receive(priority: number, timeoutMs: number): Promise<ReceivedMessage | null> {
    const consumer = this.consumers.get(RoutePriority[priority]);
    if (!consumer || !consumer.isConnected()) return null;
    return { consumer, message: await consumer.receive(timeoutMs) };
  }

  async subscribe() {
    for (const priority of RoutePriority) {
      const consumer = this.consumers.get(priority);

      if (!consumer) {
        // Subscribe to topic
        const subscriber = await this.pulsarClient.subscribe({
          subscription: 'sms',
          subscriptionType: 'Shared',
          topic: getViberRouteTopic(this.providerCode, priority, this.account.id),
        });

        this.consumers.set(priority, subscriber);
      }
    }

    this.state = 'connected';
  }

  async unsubscribe() {
    for (const priority of RoutePriority) {
      const consumer = this.consumers.get(priority);

      if (consumer && consumer.isConnected()) {
        await consumer.unsubscribe();
      }
    }
  }

  /**
   * Pause consumption without unsubscribing from consumer
   */
  async pause(timeoutMs: number = 10_000) {
    this.state = 'paused';

    try {
      await waitFor(() => this.isProcessing === false, {
        interval: 500,
        timeout: timeoutMs,
      });

      return true;
    } catch (err) {
      if (err instanceof TimeoutError) {
        return false;
      }
    }
  }

  isConnected() {
    return this.consumers.size > 0;
  }

  async start() {
    this.state = 'running';
    while (true) {
      if (this.state !== 'running') {
        this.isProcessing = false;
        break;
      }
      this.isProcessing = true;

      const { batchMessages, retryAfterMs } = await this.consumeBatch({
        maxNumMessages: 100,
        timeoutMs: 1000,
      });

      const isRateLimited = retryAfterMs > 0;
      if (isRateLimited) {
        this.pacer.throttle(retryAfterMs);
      }

      if (batchMessages.length > 0) {
        if (!isRateLimited) this.pacer.rampUp();

        // Prepare sending
        const tasks = batchMessages.map((message) => this.concurrency(() => this.sendMessage(message)));

        // Send message concurrently
        const results = await Promise.allSettled(tasks);

        // Log sending result
        const successResult = results.filter((res) => res.status === 'fulfilled');
        const errorResult = results.filter((res) => res.status === 'rejected');
        this.logger.log({ success: successResult.length, error: errorResult.length }, 'Send message results');
      } else if (!isRateLimited) {
        this.pacer.slowDown();
      }

      // Delay loop based on throttle/ramp up/slow down
      await this.pacer.wait();
    }
  }

  private async sendMessage(message: Message) {
    const data: ViberRequest = JSON.parse(message.getData().toString());
    let result: SendViberResult | null = null;

    const log = {
      id: data.id,
      platformId: data.platformId,
      playerId: data.playerId,
      type: data.routeType,
      campaignId: data.campaignId,
      campaignSender: data.campaignSender,
      providerCode: this.providerCode,
    } as const;

    try {
      switch (data.type) {
        case 'Otp':
          result = await this.sender.sendOtp(data);
          break;
        case 'Content':
          result = await this.sender.sendContentMsg(data);
          break;
        case 'Template':
          result = await this.sender.sendTemplateMsg(data);
          break;
      }
    } catch (error) {
      await this.logDispatcher.dispatchLogCreated({
        ...log,
        requestStatus: 'Failed',
        deliveryStatus: 'Failed',
      });
    }

    if (result && result.referenceId) {
      await this.logDispatcher.dispatchLogCreated({
        ...log,
        refId: result.referenceId,
        requestStatus: 'Success',
        deliveryStatus: 'Pending',
      });
    }
  }
}
