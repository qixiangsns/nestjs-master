import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { REDIS_TOKEN } from '@application/connections';
import { LimiterCounter, LimiterGrant, LimiterRule, LimiterWindowSeconds } from '../models/limiter.model';
import { LimiterPoolCache } from '../caches/limiter-pool.cache';
import { LimiterPool } from '../models/limiter-pool.model';
import { LIMITER_BLOCKED_RETRY_MS, LIMITER_DEFAULT_POINTS, LIMITER_KEY_PREFIX } from '../constants/limiter.constant';

type CounterResult = { allowed: boolean; state: RateLimiterRes };

/**
 * Take points from the pool a sender belongs to, one point per message by default.
 * Backed by rate-limiter-flexible on Redis, one fixed window per rule
 *
 * @example
 * const { allowed, retryAfterMs } = await limiterService.acquire(account.limiterPoolId);
 * const { allowed, retryAfterMs } = await limiterService.acquire(account.limiterPoolId, 5);
 *
 * @example Redis key: limiter:pool-id:<pool id>:Second
 */
@Injectable()
export class LimiterService {
  private logger = new Logger(LimiterService.name);
  private limiters = new Map<string, RateLimiterRedis>();

  constructor(
    @Inject(REDIS_TOKEN.PRIMARY) private readonly redis: Redis,
    private readonly poolCache: LimiterPoolCache,
  ) {}

  async acquire(poolId: string, points = LIMITER_DEFAULT_POINTS): Promise<LimiterGrant> {
    try {
      const pool = await this.poolCache.getPool(poolId);

      if (!pool?.isEnabled) {
        this.logger.warn({ poolId }, 'Limiter pool missing or disabled, blocking');
        return { allowed: false, retryAfterMs: LIMITER_BLOCKED_RETRY_MS };
      }

      return await this.consumeAll(this.toCounters(pool), points);
    } catch (error: unknown) {
      this.logger.error({ poolId, error }, 'Limiter unavailable, blocking');
      return { allowed: false, retryAfterMs: LIMITER_BLOCKED_RETRY_MS };
    }
  }

  private toCounters(pool: LimiterPool): LimiterCounter[] {
    return pool.rules.map((rule) => ({ key: `pool-id:${pool.id}:${rule.window}`, rule }));
  }

  private async consumeAll(counters: LimiterCounter[], points: number): Promise<LimiterGrant> {
    const results = await Promise.all(counters.map((counter) => this.consume(counter, points)));

    const refused = results.filter((res) => !res.allowed);
    if (refused.length > 0) {
      await this.undo(
        counters.filter((_, i) => results[i].allowed),
        points,
      );
      return { allowed: false, retryAfterMs: this.wait(refused) };
    }

    const emptied = results.filter((res) => res.state.remainingPoints === 0);
    return { allowed: true, retryAfterMs: this.wait(emptied) };
  }

  private async consume({ key, rule }: LimiterCounter, points: number): Promise<CounterResult> {
    try {
      return { allowed: true, state: await this.getLimiter(rule).consume(key, points) };
    } catch (error: unknown) {
      if (error instanceof RateLimiterRes) return { allowed: false, state: error };
      throw error;
    }
  }

  private async undo(counters: LimiterCounter[], points: number) {
    await Promise.all(counters.map(({ key, rule }) => this.getLimiter(rule).reward(key, points)));
  }

  private wait(results: CounterResult[]) {
    return Math.max(0, ...results.map((res) => res.state.msBeforeNext));
  }

  private getLimiter(rule: LimiterRule) {
    const id = `${rule.window}:${rule.limit}`;
    let limiter = this.limiters.get(id);

    if (!limiter) {
      limiter = new RateLimiterRedis({
        storeClient: this.redis,
        keyPrefix: LIMITER_KEY_PREFIX,
        points: rule.limit,
        duration: LimiterWindowSeconds[rule.window],
      });
      this.limiters.set(id, limiter);
    }

    return limiter;
  }
}
