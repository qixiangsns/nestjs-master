import { Module } from '@nestjs/common';
import { MongoSchemaModule } from './schemas';
import { ViberAccountRepository } from './repositories/viber-account.repository';
import { ViberAccountService } from './services/viber-account.service';
import { ViberRouteConfigRepository } from './repositories/viber-route-config.repository';
import { PlayerModule } from '@application/modules/player';
import { ViberConsumerManagerFactory } from './services/viber-consumer.service';
import { ViberRouteConfigManager } from './services/viber-route-config.manager';
import { ViberEventService } from './services/viber-event.service';

const Repositories = [ViberAccountRepository, ViberRouteConfigRepository];
const Services = [ViberAccountService, ViberConsumerManagerFactory, ViberAccountService];
const Providers = [
  ViberAccountService,
  ViberConsumerManagerFactory,
  ViberRouteConfigManager,
  ViberEventService,
  ViberAccountService,
];

@Module({
  imports: [MongoSchemaModule, PlayerModule],
  exports: [...Services],
  providers: [...Repositories, ...Providers],
})
export class ViberModule {}
