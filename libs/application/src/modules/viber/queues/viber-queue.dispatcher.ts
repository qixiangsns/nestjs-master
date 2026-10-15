import { PulsarProducerService } from '@framework/pulsar';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { PULSAR_CONN_TOKEN } from '@application/connnections';
import { Client } from 'pulsar-client';
import { ViberRequest } from '../models/viber-message.model';
import { getViberRouteTopic } from './viber-request.queues';
import { RouteAccountRoutable } from '../models/viber-route-config.model';

/**
 * Dispatch viber requests to designated provider workers
 */
@Injectable()
export class ViberQueueDispatcher extends PulsarProducerService {
  protected logger = new Logger(ViberQueueDispatcher.name);

  constructor(@Inject(PULSAR_CONN_TOKEN.PRIMARY) client: Client) {
    super(client, {
      producerConfig: {
        batchingEnabled: true,
        batchingMaxMessages: 100,
        batchingMaxPublishDelayMs: 200,
        sendTimeoutMs: 1000,
      },
    });
  }
  async dispatchOtp(request: ViberRequest, routeTo: RouteAccountRoutable) {
    const { providerCode } = routeTo.details;
    const topic = getViberRouteTopic(providerCode, 'Otp', routeTo.id);
    await this.produce(topic, request);
  }

  async dispatchMkt(request: ViberRequest, routeTo: RouteAccountRoutable) {
    const { providerCode } = routeTo.details;
    const topic = getViberRouteTopic(providerCode, 'Mkt', routeTo.id);
    await this.produce(topic, request);
  }

  async dispatchNotif(request: ViberRequest, routeTo: RouteAccountRoutable) {
    const { providerCode } = routeTo.details;
    const topic = getViberRouteTopic(providerCode, 'Notif', routeTo.id);
    await this.produce(topic, request);
  }
}
