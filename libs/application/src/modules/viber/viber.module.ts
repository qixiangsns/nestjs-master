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

const Repositories = [ViberAccountRepository, ViberRouteConfigRepository, ViberProviderRepository, ViberLogRepository];
const Services = [ViberAccountService, ViberProviderService, ViberLogService, ViberConsumerManagerFactory];
const Providers = [
  ViberAccountService,
  ViberProviderService,
  ViberLogService,
  ViberConsumerManagerFactory,
  ViberRouteConfigManager,
  ViberEventService,
];

@Module({
  imports: [MongoSchemaModule, PlayerModule],
  exports: [...Services],
  providers: [...Repositories, ...Providers],
})
export class ViberModule {}
