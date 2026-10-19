import { Module } from '@nestjs/common';
import { MongoSchemaModule } from './schemas';
import { LimiterPoolRepository } from './repositories/limiter-pool.repository';
import { LimiterPoolCache } from './caches/limiter-pool.cache';
import { LimiterPoolService } from './services/limiter-pool.service';
import { LimiterService } from './services/limiter.service';
import { LimiterSignalBroadcaster } from './signals/limiter-signal.broadcaster';

const Repositories = [LimiterPoolRepository];
const Services = [LimiterService, LimiterPoolService];
const Providers = [LimiterPoolCache, LimiterSignalBroadcaster];

@Module({
  imports: [MongoSchemaModule],
  exports: [...Services],
  providers: [...Repositories, ...Services, ...Providers],
})
export class LimiterModule {}
