import Redis from 'ioredis';
import { REDIS_SUBSCRIBER_TOKEN, REDIS_TOKEN } from '@application/connnections';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LimiterPoolSignal, LimiterPoolUpdatedSignal } from './limiter-pool.signals';

const LimiterSignalChannels: string[] = [LimiterPoolSignal.PoolUpdated];

@Injectable()
/**
 * @description Listens to redis pub/sub channel and broadcast limiter signals to the whole system
 */
export class LimiterSignalBroadcaster implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(LimiterSignalBroadcaster.name);

  constructor(
    @Inject(REDIS_SUBSCRIBER_TOKEN.PRIMARY) private readonly subscriber: Redis,
    @Inject(REDIS_TOKEN.PRIMARY) private readonly publisher: Redis,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    this.subscriber.on('message', (channel, message) => this.relay(channel, message));
    await this.subscriber.subscribe(...LimiterSignalChannels);
    this.logger.log({ channels: LimiterSignalChannels }, 'Subscribed to limiter signals');
  }

  async broadcastPoolUpdated(signal: LimiterPoolUpdatedSignal): Promise<void> {
    await this.publisher.publish(LimiterPoolSignal.PoolUpdated, JSON.stringify(signal));
  }

  private relay(channel: string, message: string) {
    if (LimiterSignalChannels.includes(channel)) {
      let payload: unknown;
      try {
        payload = JSON.parse(message);
      } catch {
        this.logger.error({ channel, message }, 'Failed to parse limiter signal');
        return;
      }

      this.eventEmitter.emit(channel, payload);
    }
  }

  async onModuleDestroy() {
    await this.subscriber.unsubscribe(...LimiterSignalChannels);
  }
}
