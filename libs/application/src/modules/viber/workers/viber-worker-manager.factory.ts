import { Injectable, Inject } from '@nestjs/common';
import { PULSAR_CONN_TOKEN } from '@application/connnections';
import { ViberEventPublisher } from '../events/viber-event.publisher';
import { ViberSenderFactory } from '../adapters/viber-sender.factory';
import { ViberProviderCode } from '../models/viber-provider.model';
import { Client } from 'pulsar-client';
import { ViberWorkerManager } from './viber-worker.manager';

@Injectable()
export class ViberWorkerManagerFactory {
  constructor(
    @Inject(PULSAR_CONN_TOKEN.PRIMARY) private readonly pulsarClient: Client,
    private readonly eventPublisher: ViberEventPublisher,
    private readonly senderFactory: ViberSenderFactory,
  ) {}

  createManager(providerCode: ViberProviderCode) {
    return new ViberWorkerManager(providerCode, this.pulsarClient, this.eventPublisher, this.senderFactory);
  }
}
