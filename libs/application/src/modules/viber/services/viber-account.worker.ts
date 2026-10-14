import { Injectable, Logger } from '@nestjs/common';
import pLimit, { LimitFunction } from 'p-limit';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { RouteType } from '../models/viber-route-config.model';
import { Consumer } from 'pulsar-client';
import { Pacer } from '@framework/utils/pacer.utils';
import { ViberProviderCode } from '../models/viber-provider.model';
import { type ViberAccountSender } from '../models/viber-account.model';
import { Client, Message } from 'pulsar-client';
import { ViberEventPublisher } from './viber-event.publisher';
import { type ViberSender } from '../interfaces/viber-sender.port';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import { getViberRouteTopic } from '../queues/viber-request.queues';
import waitFor, { TimeoutError } from 'p-wait-for';
import { ViberRequest } from '../models/viber-message.model';
import { SendViberResult } from '../models/viber-message.model';

type BatchOptions = {
  maxNumMessages: number;
  timeoutMs: number;
};

const RoutePriority: RouteType[] = ['Otp', 'Notif', 'Mkt'] as const;
type BatchResult = { retryAfterMs: number; batchMessages: Message[] };

@Injectable()
export class ViberAccountWorker {
  private logger = new Logger(ViberAccountWorker.name);
  private concurrency: LimitFunction;
  private rateLimiter: RateLimiterMemory;
  private state: 'paused' | 'running' | 'connected';
  private isProcessing: boolean;
  private consumers: Map<RouteType, Consumer> = new Map();
  private pacer: Pacer;

  constructor(
    private readonly providerCode: ViberProviderCode,
    private readonly account: ViberAccountSender,
    private readonly pulsarClient: Client,
    private readonly eventPublisher: ViberEventPublisher,
    private readonly sender: ViberSender,
  ) {
    this.pacer = new Pacer({
      maxDelayMs: 2000,
      minDelayMs: 0,
      initialBackoffMs: 100,
      backoffFactor: 2,
    });

    this.concurrency = pLimit(50);

    this.rateLimiter = new RateLimiterMemory({
      points: 1000,
      duration: 1,
    });
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
        await this.rateLimiter.consume(this.account.id, 1);
      } catch (err) {
        if (err instanceof RateLimiterRes) {
          return {
            batchMessages,
            retryAfterMs: err.msBeforeNext,
          };
        }
      }

      try {
        const consumer = this.consumers.get(RoutePriority[priority]);
        if (consumer && consumer.isConnected()) {
          const message = await consumer.receive(peekTimeoutMs);
          await consumer.acknowledge(message);

          batchMessages.push(message);
        }
      } catch (error) {
        // When queue is drained, priority moves to the lower ones
        priority = priority === lastPriority ? 0 : priority + 1;
      }
    }

    return {
      retryAfterMs: 0,
      batchMessages,
    };
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
      } else {
        // Gracedully slow down consumption when requests are low
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
      await this.eventPublisher.publishLogCreated({
        ...log,
        requestStatus: 'Failed',
        deliveryStatus: 'Failed',
      });
    }

    if (result && result.referenceId) {
      await this.eventPublisher.publishLogCreated({
        ...log,
        refId: result.referenceId,
        requestStatus: 'Success',
        deliveryStatus: 'Pending',
      });
    }
  }
}
