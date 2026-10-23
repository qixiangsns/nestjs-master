import { PulsarProducerService } from '@framework/pulsar/index.js';
import Pulsar from 'pulsar-client';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PULSAR_CONN_TOKEN } from '@application/connections/index.js';
import {
  type ViberDeliveryUpdatedQueue,
  type ViberLogCreatedQueue,
  ViberLogTopic,
} from './viber-log.queues.js';
import { getTraceHeaders, TracePublish } from '@framework/trace/index.js';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('viber-log-dispatcher');

@Injectable()
/**
 * Dispatch log to consumers for persistence
 */
export class ViberLogDispatcher extends PulsarProducerService {
  protected logger = new Logger(ViberLogDispatcher.name);

  constructor(@Inject(PULSAR_CONN_TOKEN.PRIMARY) client: Pulsar.Client) {
    super(client, {
      producerConfig: {
        batchingEnabled: true,
        batchingMaxMessages: 100,
        batchingMaxPublishDelayMs: 200,
        sendTimeoutMs: 2000,
      },
    });
  }

  @TracePublish({ name: 'dispatch-log-created', tracer })
  async dispatchLogCreated(payload: ViberLogCreatedQueue): Promise<void> {
    await this.produce(ViberLogTopic.LogCreated, payload, getTraceHeaders());
  }

  @TracePublish({ name: 'dispatch-delivery-updated', tracer })
  async dispatchDeliveryUpdated(payload: ViberDeliveryUpdatedQueue): Promise<void> {
    await this.produce(ViberLogTopic.DeliveryUpdated, payload, getTraceHeaders());
  }
}
