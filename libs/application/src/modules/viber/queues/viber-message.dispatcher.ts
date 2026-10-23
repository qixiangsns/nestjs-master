import { Injectable, Inject, Logger } from '@nestjs/common';
import Pulsar from 'pulsar-client';
import { trace } from '@opentelemetry/api';
import { PulsarProducerService } from '@framework/pulsar/index.js';
import { PULSAR_CONN_TOKEN } from '@application/connections/index.js';
import { ViberRequest } from '../models/viber-message.model.js';
import { getViberRouteTopic } from './viber-message.queues.js';
import { RouteAccountRoutable } from '../models/viber-route-config.model.js';
import { getTraceHeaders, TracePublish } from '@framework/trace/index.js';

const tracer = trace.getTracer('viber-message-dispatcher');
/**
 * Dispatch viber requests to designated provider workers
 */

type DispatchPayload = { request: ViberRequest; routeTo: RouteAccountRoutable };
@Injectable()
export class ViberMessageDispatcher extends PulsarProducerService {
  protected logger = new Logger(ViberMessageDispatcher.name);

  constructor(@Inject(PULSAR_CONN_TOKEN.PRIMARY) client: Pulsar.Client) {
    super(client, {
      producerConfig: {
        batchingEnabled: true,
        batchingMaxMessages: 100,
        batchingMaxPublishDelayMs: 200,
        sendTimeoutMs: 1000,
      },
    });
  }

  @TracePublish({ name: 'dispatch-otp', tracer })
  async dispatchOtp(payload: DispatchPayload) {
    const { routeTo, request } = payload;
    const topic = getViberRouteTopic(routeTo.details.providerCode, 'Otp', routeTo.id);
    await this.produce(topic, request, getTraceHeaders());
  }

  @TracePublish({ name: 'dispatch-mkt', tracer })
  async dispatchMkt(payload: DispatchPayload) {
    const { routeTo, request } = payload;
    const topic = getViberRouteTopic(routeTo.details.providerCode, 'Mkt', routeTo.id);
    await this.produce(topic, request, getTraceHeaders());
  }

  @TracePublish({ name: 'dispatch-notif', tracer })
  async dispatchNotif(payload: DispatchPayload) {
    const { routeTo, request } = payload;
    const topic = getViberRouteTopic(routeTo.details.providerCode, 'Notif', routeTo.id);
    await this.produce(topic, request, getTraceHeaders());
  }
}
