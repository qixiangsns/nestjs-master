import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isArrayUnique } from '@framework/utils/index.js';
import { LimiterRule, LimiterStrategy } from '../models/limiter.model.js';
import { LimiterPoolRepository } from '../repositories/limiter-pool.repository.js';
import { LimiterSignalBroadcaster } from '../signals/limiter-signal.broadcaster.js';
import { CreateLimiterPool, PatchLimiterPool } from '../dtos/limiter-pool.dto.js';

@Injectable()
export class LimiterPoolService {
  constructor(
    private readonly limiterPoolRepo: LimiterPoolRepository,
    private readonly signalBroadcaster: LimiterSignalBroadcaster,
  ) {}

  async getAllPools() {
    return this.limiterPoolRepo.getAllPools();
  }

  async findPool(id: string) {
    const pool = await this.limiterPoolRepo.findPool(id);
    if (!pool) throw new NotFoundException('Limiter pool not found');
    return pool;
  }

  async addPool(pool: CreateLimiterPool) {
    this.validateRules(pool.rules);
    await this.validateUniqueName(pool.name);
    await this.limiterPoolRepo.addPool({ ...pool, isEnabled: false });
  }

  async updatePool(id: string, pool: PatchLimiterPool) {
    await this.findPool(id);
    if (pool.rules) this.validateRules(pool.rules);
    if (pool.name) await this.validateUniqueName(pool.name, id);
    await this.limiterPoolRepo.updatePool(id, pool);
    await this.signalBroadcaster.broadcastPoolUpdated({ poolId: id });
  }

  async updateStatus(id: string, isEnabled: boolean) {
    await this.findPool(id);
    await this.limiterPoolRepo.updateStatus(id, isEnabled);
    await this.signalBroadcaster.broadcastPoolUpdated({ poolId: id });
  }

  private validateRules(rules: LimiterRule[]) {
    if (rules.length === 0) {
      throw new BadRequestException('Limiter pool requires at least one rule');
    }

    for (const strategy of LimiterStrategy) {
      const windows = rules.filter((rule) => rule.strategy === strategy).map((rule) => rule.window);
      if (!isArrayUnique(windows)) {
        throw new BadRequestException(`Limiter pool ${strategy} rules must not repeat a window`);
      }
    }
  }

  private async validateUniqueName(name: string, excludeId?: string) {
    const existing = await this.limiterPoolRepo.findPoolByName(name);
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Limiter pool ${name} already exists`);
    }
  }
}
