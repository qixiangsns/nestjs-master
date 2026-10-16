import { Injectable, Logger } from '@nestjs/common';
import { LimiterRedis } from '../adapters/limiter-redis.adapter';
import { LimiterCounter, LimiterGrant } from '../models/limiter.model';
import { LimiterPoolCache } from '../caches/limiter-pool.cache';
import { LimiterPool } from '../models/limiter-pool.model';
import { LIMITER_BLOCKED_RETRY_MS } from '../constants/limiter.constant';

/**
 * Take one point per message from the pools a sender belongs to
 *
 * @example
 * const { allowed, retryAfterMs } = await limiterService.acquire(account.limiterPoolIds);
 */
@Injectable()
export class LimiterService {
  private logger = new Logger(LimiterService.name);

  constructor(
    private readonly limiter: LimiterRedis,
    private readonly poolCache: LimiterPoolCache,
  ) {}

  async acquire(poolIds: string[]): Promise<LimiterGrant> {
    try {
      const pools = await this.poolCache.getPools(poolIds);

      if (!this.isOpen(poolIds, pools)) {
        this.logger.warn({ poolIds }, 'Limiter pool missing or disabled, blocking');
        return { allowed: false, retryAfterMs: LIMITER_BLOCKED_RETRY_MS };
      }

      return await this.limiter.acquire(this.toCounters(pools));
    } catch (error) {
      this.logger.error(
        { poolIds, error },
        'Limiter unavailable, blocking',
      );
      return { allowed: false, retryAfterMs: LIMITER_BLOCKED_RETRY_MS };
    }
  }

  private isOpen(poolIds: string[], pools: LimiterPool[]) {
    const hasPools = poolIds.length > 0;
    const allFound = pools.length === poolIds.length;
    const allEnabled = pools.every((pool) => pool.isEnabled);
    return hasPools && allFound && allEnabled;
  }

  private toCounters(pools: LimiterPool[]): LimiterCounter[] {
    return pools.flatMap((pool) => pool.rules.map((rule) => ({ key: `${pool.id}:${rule.window}`, rule })));
  }
}
