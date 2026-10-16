import { Injectable, Inject } from '@nestjs/common';
import { PULSAR_CONN_TOKEN } from '@application/connnections';
import { ViberLogDispatcher } from '../queues/viber-log.dispatcher';
import { ViberSenderFactory } from '../adapters/viber-sender.factory';
import { ViberProviderCode } from '../models/viber-provider.model';
import { Client } from 'pulsar-client';
import { ViberWorkerManager } from './viber-worker.manager';
import { LimiterService } from '@application/modules/limiter';

@Injectable()
export class ViberWorkerManagerFactory {
  constructor(
    @Inject(PULSAR_CONN_TOKEN.PRIMARY) private readonly pulsarClient: Client,
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
