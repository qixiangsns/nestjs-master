import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import pLimit from 'p-limit';
import { LimiterPoolRepository } from '../repositories/limiter-pool.repository.js';
import { LimiterPool } from '../models/limiter-pool.model.js';
import {
  LimiterPoolSignal,
  type LimiterPoolUpdatedSignal,
} from '../signals/limiter-pool.signals.js';

@Injectable()
/**
 * @description Read-through in-memory cache of limiter pools, invalidated in real-time via signals relayed by LimiterSignalBroadcaster
 */
export class LimiterPoolCache {
  private logger = new Logger(LimiterPoolCache.name);
  private pools = new Map<string, LimiterPool | null>();
  private limit = pLimit(1);

  constructor(private readonly poolRepo: LimiterPoolRepository) {}

  @OnEvent(LimiterPoolSignal.PoolUpdated)
  async handlePoolUpdated(signal: LimiterPoolUpdatedSignal) {
    await this.limit(async () => {
      try {
        await this.refresh(signal.poolId);
      } catch (error: unknown) {
        this.logger.error('Failed to refresh limiter pool', { signal }, error);
      }
    });
  }

  async getPool(id: string): Promise<LimiterPool | null> {
    if (!this.pools.has(id)) await this.refresh(id);
    return this.pools.get(id) ?? null;
  }

  private async refresh(id: string) {
    this.pools.set(id, await this.poolRepo.findPool(id));
  }
}
