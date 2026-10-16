import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LimiterRule } from '../models/limiter.model';
import { LimiterPoolRepository } from '../repositories/limiter-pool.repository';
import { LimiterSignalBroadcaster } from '../signals/limiter-signal.broadcaster';
import { CreateLimiterPool, PatchLimiterPool } from '../dtos/limiter-pool.dto';

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

  async findPools(ids: string[]) {
    return this.limiterPoolRepo.findPools(ids);
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

    const windows = rules.map((rule) => rule.window);
    if (new Set(windows).size !== windows.length) {
      throw new BadRequestException('Limiter pool rules must not repeat a window');
    }
  }

  private async validateUniqueName(name: string, excludeId?: string) {
    const existing = await this.limiterPoolRepo.findPoolByName(name);
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Limiter pool ${name} already exists`);
    }
  }
}
