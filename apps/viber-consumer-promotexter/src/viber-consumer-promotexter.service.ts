import { REDIS_TOKEN, REDIS_SUBSCRIBER_TOKEN } from '@application/connnections';
import { ViberProviderCode } from '@application/modules/viber/models/viber-provider.model';
import { type RouteAccountRoutable } from '@application/modules/viber/models/viber-route-config.model';
import { ViberAccountService } from '@application/modules/viber/services/viber-account.service';
import {
  ViberConsumerManagerFactory,
  ViberConsumerManager,
} from '@application/modules/viber/services/viber-consumer.service';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import pLimit from 'p-limit';
import { Redis } from 'ioredis';
import { ViberAccountTopic } from '@application/modules/viber/events/viber-account.events';

@Injectable()
export class ViberConsumerPromotexterService implements OnModuleInit {
  private logger: Logger = new Logger(ViberConsumerPromotexterService.name);
  private manager: ViberConsumerManager;
  private limit = pLimit(1);
  private readonly provideCode: ViberProviderCode = 'Promotexter';

  constructor(
    private readonly managerFactory: ViberConsumerManagerFactory,
    private readonly accountService: ViberAccountService,
    @Inject(REDIS_SUBSCRIBER_TOKEN.PRIMARY) private readonly redis: Redis,
  ) {
    this.manager = this.managerFactory.createManager(this.provideCode);

    this.redis.subscribe(ViberAccountTopic.AccountEnabled);
    this.redis.subscribe(ViberAccountTopic.AccountDisabled);

    this.redis.on('message', this.handleAccountUpdated);
  }

  private handleAccountUpdated(channel: string, message: string) {
    const account: RouteAccountRoutable = JSON.parse(message);
    switch (channel) {
      case ViberAccountTopic.AccountEnabled:
        this.limit(() => this.manager.addConsumer(account));
        break;
      case ViberAccountTopic.AccountDisabled:
        this.limit(() => this.manager.removeConsumer(account));
        break;
    }
  }

  async onModuleInit() {
    const accounts = await this.accountService.getEnabledProviderAccounts(this.provideCode);

    for (const account of accounts) {
      await this.manager.addConsumer({ id: account.id, isEnabled: true, weight: 1, details: account });
    }
  }
}
