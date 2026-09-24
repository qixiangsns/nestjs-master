import { CACHE_TOKEN } from '@application/connnections';
import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { type RedisCommander } from 'ioredis';
import { ViberRouteConfig } from '../schemas/viber-route-config.schema';

@Injectable()
export class ViberRouteConfigManager {
  private config: ViberRouteConfig;
  constructor(@Inject(CACHE_TOKEN.PRIMARY) redis: RedisCommander) {
    redis.subscribe('config.updated.otp', () => this.updateConfig);
    redis.subscribe('config.updated.mkt', () => this.updateConfig);
    redis.subscribe('config.updated.notif', () => this.updateConfig);
  }

  private updateConfig() {}

  async getRouteConfig() {
    if (this.config) {
      // retrieve from memory
    }

    // retrieve from repository

    return '';
  }

  onMod;
}
