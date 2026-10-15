import { Injectable, Inject } from '@nestjs/common';
import { REDIS_TOKEN } from '@application/connnections';
import { Redis } from 'ioredis';

const DEFAULT_TTL_SECONDS = 60 * 60;
const TOKEN_KEY_PREFIX = 'viber:account:token';

@Injectable()
export class ViberAccountTokenCache {
  constructor(@Inject(REDIS_TOKEN.PRIMARY) private readonly redis: Redis) {}

  /**
   * @todo decrypt token after retrieval
   * @todo check token in memory before retrieving from redis
   */
  async get(accountId: string) {
    // Decrypt
    const token = await this.redis.get(`${TOKEN_KEY_PREFIX}:${accountId}`);
    return token;
  }

  /**
   * @todo encrypt token before saving
   */
  async save(accountId: string, token: string, ttl?: number) {
    await this.redis.setex(`${TOKEN_KEY_PREFIX}:${accountId}`, ttl || DEFAULT_TTL_SECONDS, token);
  }
}
