import { PulsarProducerService, Client } from '@framework/pulsar';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PULSAR_CONN_TOKEN } from '@application/connnections';
import { ViberDeliveryUpdatedPayload, ViberLogCreatedPayload, ViberLogTopic } from '../events/viber-log.events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ViberRouteConfigTopic, ViberRouteUpdatedPayload } from '../events/viber-route-config.event';

@Injectable()
export class ViberEventService extends PulsarProducerService {
  protected logger = new Logger(ViberEventService.name);

  constructor(
    @Inject(PULSAR_CONN_TOKEN.PRIMARY) client: Client,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(client, {
      producerConfig: {
        batchingEnabled: true,
        batchingMaxMessages: 100,
        batchingMaxPublishDelayMs: 200,
        sendTimeoutMs: 2000,
      },
    });
  }
  async publishLogCreated(payload: ViberLogCreatedPayload): Promise<void> {
    await this.produce(ViberLogTopic.LogCreated, payload);
  }
  async publishDeliveryUpdated(payload: ViberDeliveryUpdatedPayload): Promise<void> {
    await this.produce(ViberLogTopic.DeliveryUpdated, payload);
  }

  async publishRouteConfigUpdated(payload: ViberRouteUpdatedPayload) {
    this.eventEmitter.emit(ViberRouteConfigTopic.RouteUpdated, payload);
  }
}
