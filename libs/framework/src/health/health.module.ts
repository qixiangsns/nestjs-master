import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';

@Module({
  imports: [TerminusModule],
  providers: [RedisHealthIndicator],
  exports: [TerminusModule, RedisHealthIndicator],
})
/**
 * Register Terminus with the custom health indicators.
 */
export class HealthModule {}
