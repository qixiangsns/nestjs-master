import { CACHE_TOKEN } from '@application/connnections';
import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { RouteType, ViberRouteConfigWithAccount } from '../models/viber-route-config.model';
import { ViberRouteConfigRepository } from '../repositories/viber-route-config.repository';

const ConfigChannel = {
  Otp: 'viber.route-config.otp.updated',
  Mkt: 'viber.route-config.mkt.updated',
  Notif: 'viber.route-config.notif.updated',
} as const;

type RouteConfigMap = Map<RouteType, ViberRouteConfigWithAccount>;
type PlatformConfigMap = Map<string, RouteConfigMap>;
@Injectable()

/**
 * This is config manager that sync config update to service local memory in real-time
 */
export class ViberRouteConfigManager implements OnModuleDestroy {
  private configMap: PlatformConfigMap;
  private logger = new Logger(ViberRouteConfigManager.name);

  constructor(
    @Inject(CACHE_TOKEN.PRIMARY) private readonly redis: Redis,
    private readonly routeConfigRepo: ViberRouteConfigRepository,
  ) {
    redis.subscribe(ConfigChannel.Mkt);
    redis.subscribe(ConfigChannel.Otp);
    redis.subscribe(ConfigChannel.Notif);

    redis.on('message', (channel, message) => this.handleConfigUpdate(channel, message));
  }

  private async handleConfigUpdate(channel: string, platformId: string) {
    try {
      switch (channel) {
        case ConfigChannel.Mkt:
          await this.findAndUpdateConfigMemory('Mkt', platformId);
          break;
        case ConfigChannel.Otp:
          await this.findAndUpdateConfigMemory('Otp', platformId);
          break;
        case ConfigChannel.Notif:
          await this.findAndUpdateConfigMemory('Notif', platformId);
          break;
      }
    } catch (err) {
      this.logger.error({ err }, 'Error syncing viber route config');
    }
  }

  /**
   * @description Retrieved synced config blazingly fast from local memory
   */
  async getRouteConfig(routeType: RouteType, platformId: string) {
    const routeConfigMemory = this.configMap.get(platformId)?.get(routeType);
    if (routeConfigMemory) return routeConfigMemory;

    const routeConfigDb = await this.findAndUpdateConfigMemory(routeType, platformId);
    return routeConfigDb;
  }

  private async findAndUpdateConfigMemory(routeType: RouteType, platformId: string) {
    // retrieve from repository
    const config = await this.routeConfigRepo.findConfig(routeType, platformId);
    if (!config) return null;

    // update local config
    const platformConfig = this.configMap.get(platformId) ?? new Map<RouteType, ViberRouteConfigWithAccount>();
    platformConfig.set(routeType, config);
    this.configMap.set(platformId, platformConfig);
    return config;
  }

  async onModuleDestroy() {
    await this.redis.unsubscribe(ConfigChannel.Otp);
    await this.redis.unsubscribe(ConfigChannel.Mkt);
    await this.redis.unsubscribe(ConfigChannel.Notif);
  }
}
