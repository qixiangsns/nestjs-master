import Redis from 'ioredis';
import { REDIS_SUBSCRIBER_TOKEN, REDIS_TOKEN } from '@application/connnections';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountDisabledSignal, AccountEnabledSignal, ViberAccountSignal } from '../signals/viber-account.signals';
import { ViberRouteConfigSignal, ViberRouteUpdatedSignal } from '../signals/viber-route-config.signals';

const ViberSignalChannels: string[] = [
  ViberAccountSignal.AccountDisabled,
  ViberAccountSignal.AccountEnabled,
  ViberRouteConfigSignal.RouteUpdated,
];

@Injectable()
/**
 * @description Listens to redis pub/sub channel and broadcast signal to the whole system
 */
export class ViberSignalBroadcaster implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(ViberSignalBroadcaster.name);

  constructor(
    @Inject(REDIS_SUBSCRIBER_TOKEN.PRIMARY) private readonly subscriber: Redis,
    @Inject(REDIS_TOKEN.PRIMARY) private readonly publisher: Redis,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    this.subscriber.on('message', (channel, message) => this.relay(channel, message));
    await this.subscriber.subscribe(...ViberSignalChannels);
    this.logger.log({ channels: ViberSignalChannels }, 'Subscribed to viber signals');
  }

  async broadcastAccountEnabled(signal: AccountEnabledSignal): Promise<void> {
    await this.publish(ViberAccountSignal.AccountEnabled, signal);
  }

  async broadcastAccountDisabled(signal: AccountDisabledSignal): Promise<void> {
    await this.publish(ViberAccountSignal.AccountDisabled, signal);
  }

  async broadcastRouteUpdated(signal: ViberRouteUpdatedSignal): Promise<void> {
    await this.publish(ViberRouteConfigSignal.RouteUpdated, signal);
  }

  private async publish(channel: string, payload: unknown) {
    await this.publisher.publish(channel, JSON.stringify(payload));
  }

  private relay(channel: string, message: string) {
    if (ViberSignalChannels.includes(channel)) {
      let payload: unknown;
      try {
        payload = JSON.parse(message);
      } catch (error) {
        this.logger.error({ channel, message }, 'Failed to parse viber signal');
        return;
      }

      this.eventEmitter.emit(channel, payload);
    }
  }

  async onModuleDestroy() {
    await this.subscriber.unsubscribe(...ViberSignalChannels);
  }
}
