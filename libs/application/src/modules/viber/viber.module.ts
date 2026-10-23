import { Module } from '@nestjs/common';
import { MongoSchemaModule } from './schemas/index.js';
import { ViberAccountRepository } from './repositories/viber-account.repository.js';
import { ViberAccountService } from './services/viber-account.service.js';
import { ViberRouteConfigRepository } from './repositories/viber-route-config.repository.js';
import { PlayerModule } from '@application/modules/player/index.js';
import { LimiterModule } from '@application/modules/limiter/index.js';
import { ViberProviderRepository } from './repositories/viber-provider.repository.js';
import { ViberProviderService } from './services/viber-provider.service.js';
import { ViberLogRepository } from './repositories/viber-log.repository.js';
import { ViberLogService } from './services/viber-log.service.js';
import { ViberRouteConfigCache } from './caches/viber-route-config.cache.js';
import { ViberLogDispatcher } from './queues/viber-log.dispatcher.js';
import { ViberRouteConfigService } from './services/viber-route-config.service.js';
import { ViberSenderFactory } from './adapters/viber-sender.factory.js';
import { ViberAccountTokenCache } from './caches/viber-account-token.cache.js';
import { ViberPromotexterClientFactory } from './adapters/promotexter/viber-promotexter-client.factory.js';
import { ViberPromotexterApixClientFactory } from './adapters/promotexter-apix/viber-promotexter-apix-client.factory.js';
import { ViberSenderService } from './services/viber-sender.service.js';
import { ViberMessageDispatcher } from './queues/viber-message.dispatcher.js';
import { ViberSignalBroadcaster } from './signals/viber-signal.broadcaster.js';
import { ViberWorkerManagerFactory } from './workers/viber-worker-manager.factory.js';

const Repositories = [
  ViberAccountRepository,
  ViberRouteConfigRepository,
  ViberProviderRepository,
  ViberLogRepository,
];
const Services = [
  ViberAccountService,
  ViberProviderService,
  ViberLogService,
  ViberRouteConfigService,
  ViberWorkerManagerFactory,
  ViberSenderService,
];
const Providers = [
  ViberAccountService,
  ViberProviderService,
  ViberLogService,
  ViberRouteConfigService,
  ViberRouteConfigCache,
  ViberMessageDispatcher,
  ViberSenderFactory,
  ViberPromotexterClientFactory,
  ViberPromotexterApixClientFactory,
  ViberAccountTokenCache,
  ViberSenderService,
  ViberLogDispatcher,
  ViberSignalBroadcaster,
  ViberWorkerManagerFactory,
];

@Module({
  imports: [MongoSchemaModule, PlayerModule, LimiterModule],
  exports: [...Services],
  providers: [...Repositories, ...Providers],
})
export class ViberModule {}
