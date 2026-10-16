import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { LimiterCounter, LimiterGrant, LimiterRule, LimiterWindowSeconds } from '../models/limiter.model';
import { REDIS_TOKEN } from '@application/connnections';
import { LIMITER_KEY_PREFIX } from '../constants/limiter.constant';

type CounterResult = { allowed: boolean; state: RateLimiterRes };

/**
 * Limiter backed by rate-limiter-flexible, one fixed window per rule
 *
 * @example Redis key: limiter:<pool id>:Second
 */
@Injectable()
export class LimiterRedis {
  private limiters = new Map<string, RateLimiterRedis>();

  constructor(@Inject(REDIS_TOKEN.PRIMARY) private readonly redis: Redis) {}

  async acquire(counters: LimiterCounter[]): Promise<LimiterGrant> {
    const results = await Promise.all(counters.map((counter) => this.consume(counter)));

    const refused = results.filter((res) => !res.allowed);
    if (refused.length > 0) {
      await this.undo(counters.filter((_, i) => results[i].allowed));
      return { allowed: false, retryAfterMs: this.wait(refused) };
    }

    const emptied = results.filter((res) => res.state.remainingPoints === 0);
    return { allowed: true, retryAfterMs: this.wait(emptied) };
  }

  private async consume({ key, rule }: LimiterCounter): Promise<CounterResult> {
    try {
      return { allowed: true, state: await this.getLimiter(rule).consume(key, 1) };
    } catch (error) {
      if (error instanceof RateLimiterRes) return { allowed: false, state: error };
      throw error;
    }
  }

  private async undo(counters: LimiterCounter[]) {
    await Promise.all(counters.map(({ key, rule }) => this.getLimiter(rule).reward(key, 1)));
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
