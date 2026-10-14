import { ViberProviderCode } from '@application/modules/viber/models/viber-provider.model';
import { ViberAccountService } from '@application/modules/viber/services/viber-account.service';
import {
  ViberConsumerManagerFactory,
  ViberConsumerManager,
} from '@application/modules/viber/services/viber-consumer.service';
import { Injectable, Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import pLimit from 'p-limit';
import {
  ViberAccountSignal,
  type AccountDisabledSignal,
  type AccountEnabledSignal,
} from '@application/modules/viber/signals/viber-account.signals';

@Injectable()
export class ViberConsumerPromotexterService implements OnModuleInit, OnApplicationShutdown {
  private logger: Logger = new Logger(ViberConsumerPromotexterService.name);
  private manager: ViberConsumerManager;
  // process account signals one at a time so consumers are added/removed in arrival order
  private limit = pLimit(1);
  private readonly provideCode: ViberProviderCode = 'MockProvider';

  constructor(
    private readonly managerFactory: ViberConsumerManagerFactory,
    private readonly accountService: ViberAccountService,
  ) {
    this.manager = this.managerFactory.createManager(this.provideCode);
  }

  @OnEvent(ViberAccountSignal.AccountEnabled)
  async handleAccountEnabled(signal: AccountEnabledSignal) {
    await this.limit(async () => {
      this.logger.log({ signal }, 'Received viber account enabled signal');
      try {
        const account = await this.accountService.findAccount(signal.accountId);
        if (!account) {
          throw new Error(`Account cannot be found`);
        }
        await this.manager.addConsumer(account);
      } catch (error: unknown) {
        this.logger.error({ error, signal }, 'Failed to add viber account consumer');
      }
    });
  }

  @OnEvent(ViberAccountSignal.AccountDisabled)
  async handleAccountDisabled(signal: AccountDisabledSignal) {
    await this.limit(async () => {
      this.logger.log({ signal }, 'Received viber account disabled signal');
      try {
        await this.manager.removeConsumer(signal.accountId);
      } catch (error: unknown) {
        this.logger.error({ error, signal }, 'Failed to remove viber account consumer');
      }
    });
  }

  async onModuleInit() {
    const accounts = await this.accountService.findEnabledAccountsByProvider(this.provideCode);

    for (const account of accounts) {
      await this.manager.addConsumer(account);
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log({ receivedAt: new Date(), signal }, 'Received shutdown signal at ');
    await this.manager.stopConsumers();
    this.logger.log({ finishedAt: new Date() }, 'Finished processing and disconnected from consumers');
  }
}
