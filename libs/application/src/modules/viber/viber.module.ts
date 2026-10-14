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
import { ViberRouteConfigCache } from './services/viber-route-config.cache';
import { ViberEventPublisher } from './services/viber-event.publisher';
import { ViberRouteConfigService } from './services/viber-route-config.service';
import {
  ViberAccountTokenStore,
  ViberPromotexterApixClientFactory,
  ViberPromotexterClientFactory,
  ViberSenderFactory,
} from './services/viber-sender.factory';
import { ViberSenderService } from './services/viber-sender.service';
import { ViberQueueDispatcher } from './services/viber-queue.dispatcher';
import { ViberSignalBroadcaster } from './services/viber-signal.broadcaster';

const Repositories = [ViberAccountRepository, ViberRouteConfigRepository, ViberProviderRepository, ViberLogRepository];
const Services = [
  ViberAccountService,
  ViberProviderService,
  ViberLogService,
  ViberRouteConfigService,
  ViberConsumerManagerFactory,
  ViberSenderService,
];
const Providers = [
  ViberAccountService,
  ViberProviderService,
  ViberLogService,
  ViberRouteConfigService,
  ViberConsumerManagerFactory,
  ViberRouteConfigCache,
  ViberEventPublisher,
  ViberSenderFactory,
  ViberPromotexterClientFactory,
  ViberPromotexterApixClientFactory,
  ViberAccountTokenStore,
  ViberSenderService,
  ViberQueueDispatcher,
  ViberSignalBroadcaster,
];

@Module({
  imports: [MongoSchemaModule, PlayerModule],
  exports: [...Services],
  providers: [...Repositories, ...Providers],
})
export class ViberModule {}
