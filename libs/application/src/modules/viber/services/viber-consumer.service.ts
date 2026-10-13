import { Consumer, Client, Message } from 'pulsar-client';
import { ViberRouteConfigManager } from './viber-route-config.manager';
import { Logger, Inject, Injectable } from '@nestjs/common';
import { PULSAR_CONN_TOKEN } from '@application/connnections';
import { OnEvent } from '@nestjs/event-emitter';
import { debounce } from 'perfect-debounce';
import { addMilliseconds, differenceInMilliseconds } from 'date-fns';
import { RouteType } from '../models/viber-route-config.model';
import pLimit, { LimitFunction } from 'p-limit';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { getViberRouteTopic } from '../events/viber-route.events';
import { ViberProviderCode } from '../models/viber-provider.model';
import { Pacer } from '@framework/utils/pacer.utils';
import { ViberSenderFactory } from './viber-sender.factory';
import { type ViberSender } from '../interfaces/viber-sender.port';
import { SendViberResult, ViberRequest } from '../models/viber-message.model';
import { ViberEventService } from './viber-event.service';
import waitFor, { TimeoutError } from 'p-wait-for';
import { type ViberAccountSender } from '../models/viber-account.model';

type BatchOptions = {
  maxNumMessages: number;
  timeoutMs: number;
};
const QueuePriority: RouteType[] = ['Otp', 'Notif', 'Mkt'] as const;

type ConsumeBatch = { retryAfterMs: number; batchMessages: Message[] };

@Injectable()
export class ViberAccountConsumer {
  private logger = new Logger(ViberAccountConsumer.name);
  private concurrency: LimitFunction;
  private rateLimiter: RateLimiterMemory;
  private state: 'paused' | 'running' | 'connected';
  private isProcessing: boolean;
  private consumers: Map<RouteType, Consumer>;
  private pacer: Pacer;

  constructor(
    private readonly providerCode: ViberProviderCode,
    private readonly account: ViberAccountSender,
    private readonly pulsarClient: Client,
    private readonly eventService: ViberEventService,
    private readonly sender: ViberSender,
  ) {
    this.pacer = new Pacer({
      maxDelayMs: 1000,
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

  private async consumeBatch(options: BatchOptions): Promise<ConsumeBatch> {
    let priority = 0;

    const lastPriority = QueuePriority.length - 1;
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
        const consumer = this.consumers.get(QueuePriority[priority]);
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
    for (const priority of QueuePriority) {
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
    for (const priority of QueuePriority) {
      const consumer = this.consumers.get(priority);

      if (consumer && consumer.isConnected()) {
        await consumer.unsubscribe();
      }
    }
  }

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

      let messages: Message[] = [];

      const { batchMessages = messages, retryAfterMs } = await this.consumeBatch({
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
        const tasks = messages.map((message) => this.concurrency(() => this.sendMessage(message)));

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
      await this.eventService.publishLogCreated({
        ...log,
        requestStatus: 'Failed',
        deliveryStatus: 'Failed',
      });
    }

    if (result && result.referenceId) {
      await this.eventService.publishLogCreated({
        ...log,
        refId: result.referenceId,
        requestStatus: 'Success',
        deliveryStatus: 'Pending',
      });
    }
  }
}

/**
 * Factory function to dynamically create viber consumers with dependencies at runtime
 *
 * @example
 * const manager = factory.createManager("Promotexter");
 * await manager.subscribe()
 * manager.start()
 * manager.pause()
 */
@Injectable()
export class ViberConsumerManagerFactory {
  constructor(
    @Inject(PULSAR_CONN_TOKEN.PRIMARY) private readonly pulsarClient: Client,
    private readonly eventService: ViberEventService,
    private readonly senderFactory: ViberSenderFactory,
  ) {}

  createManager(providerCode: ViberProviderCode) {
    return new ViberConsumerManager(providerCode, this.pulsarClient, this.eventService, this.senderFactory);
  }
}

/**
 * Manages Viber message consumers for different accounts. It listens for configuration updates and adjusts the consumers accordingly.
 *
 * @example
 * const manager = new ViberConsumerManager(client, configManager, eventService);
 * await manager.subscribe();
 * manager.start();
 * manager.pause();
 *
 */
export class ViberConsumerManager {
  private accountConsumers: Map<string, ViberAccountConsumer> = new Map();
  private logger = new Logger(ViberConsumerManager.name);

  constructor(
    private readonly providerCode: ViberProviderCode,
    private readonly pulsarClient: Client,
    private readonly eventService: ViberEventService,
    private readonly senderFactory: ViberSenderFactory,
  ) {}

  async subscribe(accounts: ViberAccountSender[]) {
    const enabledAccounts = accounts.filter((acc) => acc.providerCode === this.providerCode);

    if (enabledAccounts.length === 0) {
      this.logger.log('No accounts available now');
    }

    for (const account of enabledAccounts) await this.addConsumer(account);
  }

  async addConsumer(account: ViberAccountSender) {
    if (account.providerCode !== this.providerCode) {
      throw new Error(
        `${ViberConsumerManager.name} failed to add consumer due to provider incompatibility ${account.providerCode}`,
      );
    }

    if (this.accountConsumers.has(account.id)) return;

    const sender = await this.senderFactory.createSender(account);
    const consumer = new ViberAccountConsumer(this.providerCode, account, this.pulsarClient, this.eventService, sender);
    await consumer.subscribe();
    this.accountConsumers.set(account.id, consumer);
    consumer.start();
  }

  async removeConsumer(account: ViberAccountSender) {
    if (account.providerCode !== this.providerCode) return false;
    if (this.accountConsumers.has(account.id)) return false;
    const consumer = this.accountConsumers.get(account.id);
    if (consumer) {
      await consumer.pause(30_000); // 30 seconds
      await consumer.unsubscribe();
    }
  }

  async startConsuming() {
    for (const consumer of this.accountConsumers.values()) consumer.start();
  }

  async pauseConsuming() {
    for (const consumer of this.accountConsumers.values()) await consumer.pause();
  }
}
