import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health.js';

@Module({
  imports: [TerminusModule],
  providers: [RedisHealthIndicator],
  exports: [TerminusModule, RedisHealthIndicator],
})
/**
 * Register Terminus with the custom health indicators.
 */
export class HealthModule {}
