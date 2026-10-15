import { PulsarProducerService, Client } from '@framework/pulsar';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PULSAR_CONN_TOKEN } from '@application/connnections';
import { ViberDeliveryUpdatedEvent, ViberLogCreatedEvent, ViberLogTopic } from '../events/viber-log.events';

@Injectable()
export class ViberEventPublisher extends PulsarProducerService {
  protected logger = new Logger(ViberEventPublisher.name);

  constructor(@Inject(PULSAR_CONN_TOKEN.PRIMARY) client: Client) {
    super(client, {
      producerConfig: {
        batchingEnabled: true,
        batchingMaxMessages: 100,
        batchingMaxPublishDelayMs: 200,
        sendTimeoutMs: 2000,
      },
    });
  }
  async publishLogCreated(payload: ViberLogCreatedEvent): Promise<void> {
    await this.produce(ViberLogTopic.LogCreated, payload);
  }
  async publishDeliveryUpdated(payload: ViberDeliveryUpdatedEvent): Promise<void> {
    await this.produce(ViberLogTopic.DeliveryUpdated, payload);
  }
}
