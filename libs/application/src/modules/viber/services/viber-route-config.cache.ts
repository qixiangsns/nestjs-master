import Redis from 'ioredis';
import { REDIS_TOKEN } from '@application/connnections';
import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { RoutableViberRouteConfig, RouteType } from '../models/viber-route-config.model';
import { ViberRouteConfigRepository } from '../repositories/viber-route-config.repository';
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
 * @description Read-through in-memory cache of route configs, invalidated in real-time via redis pub/sub
 */
export class ViberRouteConfigCache implements OnModuleDestroy {
  private logger = new Logger(ViberRouteConfigCache.name);
  private configMap: ConfigMap = new Map();
  // a subscribed redis connection can only run pub/sub commands, so use a dedicated one
  private readonly subscriber: Redis;

  constructor(
    @Inject(REDIS_TOKEN.PRIMARY) redis: Redis,
    private readonly routeConfigRepo: ViberRouteConfigRepository,
  ) {
    this.subscriber = redis.duplicate();
    this.subscriber.subscribe(ViberRouteConfigTopic.RouteUpdated);
    this.subscriber.on('message', (channel, message) => this.handleConfigUpdate(channel, message));
  }

  private async handleConfigUpdate(channel: string, message: string) {
    if (channel === ViberRouteConfigTopic.RouteUpdated) {
      const config: ViberRouteUpdatedPayload = JSON.parse(message);
      await this.refresh(config.type, config.platformId);
    }
  }

  /**
   * Retrieve in-memory config for blazingly fast retrieval
   */
  async get(routeType: RouteType, platformId: string) {
    const config = this.configMap.get(platformId)?.get(routeType);
    if (config) return config;

    return this.refresh(routeType, platformId);
  }

  private async refresh(routeType: RouteType, platformId: string) {
    // retrieve from store
    const config = await this.routeConfigRepo.findRoutableConfig(routeType, platformId);

    // update memory config
    const platformConfig = this.configMap.get(platformId) ?? new Map<RouteType, RoutableViberRouteConfig>();
    if (config) {
      platformConfig.set(routeType, config);
    } else {
      // route removed or no longer routable, evict stale entry
      platformConfig.delete(routeType);
    }
    this.configMap.set(platformId, platformConfig);
    return config ?? null;
  }

  async onModuleDestroy() {
    await this.subscriber.unsubscribe(ViberRouteConfigTopic.RouteUpdated);
  }
}
