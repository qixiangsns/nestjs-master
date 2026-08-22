// IdempotencyService.js
import { RedisCommander } from 'ioredis';

/**
 * This service is used to ensure that a message is processed only once.
 *
 * Use cases:
 * - cron
 * - message broker consumer
 * - API endpoint
 */

type Options = {
  keyPrefix?: string;
  ttl: number;
  redisClient: RedisCommander;
};

export class IdempotencyService {
  private redis: RedisCommander;
  private ttl: number;
  private keyPrefix?: string;

  constructor(private readonly options: Options) {
    this.redis = options.redisClient;
    this.ttl = options.ttl;
    this.keyPrefix = options.keyPrefix || 'idempotency';
  }

  private buildKey(key: string) {
    return `${this.keyPrefix}:${key}`;
  }

  async ensureOnce(identifier: string) {
    const cacheKey = this.buildKey(identifier);
    const result = await this.redis.setnx(cacheKey, 1);

    // If the key was set, add expiration
    if (result === 1) {
      await this.redis.expire(cacheKey, this.ttl);
    }

    // If the key was not set, it means the identifier was already processed
    return result === 0;
  }

  async markProcessed(identifier: string, ttl?: number) {
    const cacheKey = this.buildKey(identifier);
    await this.redis.setex(cacheKey, this.ttl, 1);
  }

  async isProcessed(identifier: string) {
    const cacheKey = this.buildKey(identifier);
    return (await this.redis.exists(cacheKey)) === 1;
  }

  async clear(identifier: string) {
    const cacheKey = this.buildKey(identifier);
    await this.redis.del(cacheKey);
  }
}
