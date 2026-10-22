import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { Redis } from 'ioredis';

@Injectable()
/**
 * Check a Redis client is connected and answers PING.
 */
export class RedisHealthIndicator {
  constructor(private readonly healthIndicatorService: HealthIndicatorService) {}

  pingCheck(key: string, client: Redis) {
    return this.healthIndicatorService.check(key).attempt(async () => {
      if (client.status !== 'ready') throw new Error(`Redis client is not ready (status: ${client.status})`);
      await client.ping();
    });
  }
}
