import Redis from 'ioredis';
import { CACHE_TOKEN } from '@application/connnections';
import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { RoutableViberRouteConfig, RouteAccountRoutable, RouteType } from '../models/viber-route-config.model';
import { ViberRouteConfigRepository } from '../repositories/viber-route-config.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ViberRouteConfigTopic, ViberRouteUpdatedPayload } from '../events/viber-route-config.event';

type RouteConfigMap = Map<RouteType, RoutableViberRouteConfig>;
/**
 * @example Config map group by platform id and route type
 *
 * <"50",
 *  <"Otp", RouteAccountRoutable[]>,
 *  <"Mkt", RouteAccountRoutable[]>,
 *  <"Notif", RouteAccountRoutable[]>
 * >
 *
 * <"999",
 *  <"Otp", RouteAccountRoutable[]>,
 *  <"Mkt", RouteAccountRoutable[]>,
 *  <"Notif", RouteAccountRoutable[]>
 * >
 */
type ConfigMap = Map<string, RouteConfigMap>;

@Injectable()
/**
 * @description This is config manager that sync config update to service local memory in real-time
 */
export class ViberRouteConfigManager implements OnModuleDestroy {
  private logger = new Logger(ViberRouteConfigManager.name);
  private configMap: ConfigMap = new Map();

  constructor(
    @Inject(CACHE_TOKEN.PRIMARY) private readonly redis: Redis,
    private readonly routeConfigRepo: ViberRouteConfigRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.redis.subscribe(ViberRouteConfigTopic.RouteUpdated);
    this.redis.on('message', (channel, message) => this.handleConfigUpdate(channel, message));
  }

  private async handleConfigUpdate(channel: string, message: string) {
    if (channel === ViberRouteConfigTopic.RouteUpdated) {
      const config: ViberRouteUpdatedPayload = JSON.parse(message);
      await this.refreshConfig(config.type, config.platformId);
    }
  }

  getRoutableAccounts() {
    const accounts = new Map<string, RouteAccountRoutable>();
    for (const platformConfig of this.configMap.values()) {
      for (const routeConfig of platformConfig.values()) {
        for (const account of routeConfig.accounts) {
          if (account.isEnabled) {
            accounts.set(account.id, account);
          }
        }
      }
    }

    return Array.from(accounts.values());
  }

  /**
   * Retrieve in-memory config for blazingly fast retrieval
   */
  async getRouteConfig(routeType: RouteType, platformId: string) {
    let config: RoutableViberRouteConfig | null;

    config = this.configMap.get(platformId)?.get(routeType) || null;
    if (config) return config;

    config = await this.refreshConfig(routeType, platformId);
    if (config) return config;

    return null;
  }

  private async refreshConfig(routeType: RouteType, platformId: string) {
    // retrieve from store
    const config = await this.routeConfigRepo.findRoutableConfig(routeType, platformId);
    if (!config) return null;

    // update memory config
    const platformConfig = this.configMap.get(platformId) ?? new Map<RouteType, RoutableViberRouteConfig>();
    platformConfig.set(routeType, config);
    this.configMap.set(platformId, platformConfig);
    return config;
  }

  async onModuleDestroy() {
    await this.redis.unsubscribe(ViberRouteConfigTopic.RouteUpdated);
  }
}
