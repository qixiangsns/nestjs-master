import { PulsarProducerService, Client } from '@framework/pulsar';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PULSAR_CONN_TOKEN } from '@application/connnections';
import { ViberAccount } from '../models/viber-account.model';
import { getViberRouteEventName, ViberQueueEvent } from '../events/viber.events';
import { DeliveryStatus, ViberLog } from '../models/viber-log.model';
import { Except } from 'type-fest';
import { ViberRequest } from '../models/viber-message.model';

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

  async publishOtpRequested(
    routeTo: Except<ViberAccount, 'id' | 'createdAt' | 'updatedAt'>,
    payload: ViberRequest,
  ): Promise<void> {
    const eventName = getViberRouteEventName(routeTo.providerCode, 'Otp');
    await this.produce(eventName, payload);
  }

  async publishMktRequested(
    routeTo: Except<ViberAccount, 'id' | 'createdAt' | 'updatedAt'>,
    payload: ViberRequest,
  ): Promise<void> {
    const eventName = getViberRouteEventName(routeTo.providerCode, 'Mkt');
    await this.produce(eventName, payload);
  }

  async publishNotifRequested(
    routeTo: Except<ViberAccount, 'id' | 'createdAt' | 'updatedAt'>,
    payload: ViberRequest,
  ): Promise<void> {
    const eventName = getViberRouteEventName(routeTo.providerCode, 'Notif');
    await this.produce(eventName, payload);
  }

  async publishLogCreated(log: ViberLog): Promise<void> {
    await this.produce(ViberQueueEvent.LogCreated, log);
  }
  async publishDeliveryUpdated(referenceId: string, status: DeliveryStatus): Promise<void> {
    await this.produce(ViberQueueEvent.DeliveryUpdated, { referenceId, status });
  }
}
