import { Module } from '@nestjs/common';
import { MongoSchemaModule } from './schemas';
import { ViberAccountRepository } from './repositories/viber-account.repository';
import { ViberAccountService } from './services/viber-account.service';
import { ViberRouteConfigRepository } from './repositories/viber-route-config.repository';
import { PlayerModule } from '@application/modules/player';
import { ViberProviderRepository } from './repositories/viber-provider.repository';
import { ViberProviderService } from './services/viber-provider.service';
import { ViberLogRepository } from './repositories/viber-log.repository';
import { ViberLogService } from './services/viber-log.service';
import { ViberConsumerManagerFactory } from './services/viber-consumer.service';
import { ViberRouteConfigManager } from './services/viber-route-config.manager';
import { ViberEventService } from './services/viber-event.service';
import { ViberRouteConfigService } from './services/viber-route-config.service';
import {
  ViberAccountTokenStore,
  ViberPromotexterClientFactory,
  ViberSenderFactory,
} from './services/viber-sender.factory';

const Repositories = [ViberAccountRepository, ViberRouteConfigRepository, ViberProviderRepository, ViberLogRepository];
const Services = [
  ViberAccountService,
  ViberProviderService,
  ViberLogService,
  ViberRouteConfigService,
  ViberConsumerManagerFactory,
];
const Providers = [
  ViberAccountService,
  ViberProviderService,
  ViberLogService,
  ViberRouteConfigService,
  ViberConsumerManagerFactory,
  ViberRouteConfigManager,
  ViberEventService,
  ViberSenderFactory,
  ViberPromotexterClientFactory,
  ViberAccountTokenStore,
];

@Module({
  imports: [MongoSchemaModule, PlayerModule],
  exports: [...Services],
  providers: [...Repositories, ...Providers],
})
export class ViberModule {}
