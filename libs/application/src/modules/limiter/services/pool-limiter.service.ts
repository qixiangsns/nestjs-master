import { REDIS_TOKEN } from '@application/connnections';
import { Inject, Injectable } from '@nestjs/common';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';

@Injectable()
export class PoolLimiter {
  private rateLimiter: RateLimiterRedis;

  constructor(@Inject(REDIS_TOKEN.PRIMARY) private readonly redis: Redis) {
    this.rateLimiter = new RateLimiterRedis({
      duration: 1,
      points: 100,
      keyPrefix: 'rate-limit-pool',
      storeClient: redis,
    });
  }

  private createLimiter() {}

  async consume(poolId: string, points: number): Promise<boolean> {
    const poolConfig = {
      requestPerSecond: 1,
      requestPerMinute: 1,
      requestPerHour: 1,
      requestPerDay: 1,
    } as const;

    if (poolConfig.requestPerDay) {
      await this.rateLimiter.consume(`${poolId}:day`, 1);
    }

    if (poolConfig.requestPerHour) {
      await this.rateLimiter.consume(`${poolId}:hour`, 1);
    }

    if (poolConfig.requestPerMinute) {
      await this.rateLimiter.consume(`${poolId}:minute`, 1);
    }

    if (poolConfig.requestPerMinute) {
      await this.rateLimiter.consume(`${poolId}:second`, 1);
    }

    return true;
  }
}
