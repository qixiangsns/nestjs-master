import { Injectable, Inject } from '@nestjs/common';
import { PULSAR_CONN_TOKEN } from '@application/connections/index.js';
import { ViberLogDispatcher } from '../queues/viber-log.dispatcher.js';
import { ViberSenderFactory } from '../adapters/viber-sender.factory.js';
import { ViberProviderCode } from '../models/viber-provider.model.js';
import Pulsar from 'pulsar-client';
import { ViberWorkerManager } from './viber-worker.manager.js';
import { LimiterService } from '@application/modules/limiter/index.js';

@Injectable()
export class ViberWorkerManagerFactory {
  constructor(
    @Inject(PULSAR_CONN_TOKEN.PRIMARY) private readonly pulsarClient: Pulsar.Client,
    private readonly logDispatcher: ViberLogDispatcher,
    private readonly senderFactory: ViberSenderFactory,
    private readonly limiter: LimiterService,
  ) {}

  createManager(providerCode: ViberProviderCode) {
    return new ViberWorkerManager(
      providerCode,
      this.pulsarClient,
      this.logDispatcher,
      this.senderFactory,
      this.limiter,
    );
  }
}
