import { ViberAccountWorker } from './viber-account.worker';
import { Logger } from '@nestjs/common';
import { ViberProviderCode } from '../models/viber-provider.model';
import { Client } from 'pulsar-client';
import { ViberEventPublisher } from '../events/viber-event.publisher';
import { ViberSenderFactory } from '../adapters/viber-sender.factory';
import { ViberAccountSender } from '../models/viber-account.model';
import { LimiterService } from '@application/modules/limiter';

export class ViberWorkerManager {
  private accountConsumers: Map<string, ViberAccountWorker> = new Map();
  private logger = new Logger(ViberAccountWorker.name);

  constructor(
    private readonly providerCode: ViberProviderCode,
    private readonly pulsarClient: Client,
    private readonly eventPublisher: ViberEventPublisher,
    private readonly senderFactory: ViberSenderFactory,
    private readonly limiter: LimiterService,
  ) {}

  async addConsumer(account: ViberAccountSender) {
    if (account.providerCode !== this.providerCode) {
      throw new Error(
        `${ViberWorkerManager.name} failed to add consumer due to provider incompatibility ${account.providerCode}`,
      );
    }

    if (this.accountConsumers.has(account.id)) return;

    const sender = await this.senderFactory.createSender(account);
    const consumer = new ViberAccountWorker(
      this.providerCode,
      account,
      this.pulsarClient,
      this.eventPublisher,
      sender,
      this.limiter,
    );
    await consumer.subscribe();
    this.accountConsumers.set(account.id, consumer);
    consumer.start();
  }

  async removeConsumer(accountId: string) {
    if (!this.accountConsumers.has(accountId)) return;
    const consumer = this.accountConsumers.get(accountId);
    if (consumer) {
      await consumer.pause(30_000); // 30 seconds
      await consumer.unsubscribe();
    }
  }

  async stopConsumers() {
    for (const consumer of this.accountConsumers.values()) {
      await consumer.pause(30_000); // 30 seconds
      await consumer.unsubscribe();
    }
  }
}
