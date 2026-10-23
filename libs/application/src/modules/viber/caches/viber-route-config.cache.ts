import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import pLimit from 'p-limit';
import { RoutableViberRouteConfig, RouteType } from '../models/viber-route-config.model.js';
import { ViberRouteConfigRepository } from '../repositories/viber-route-config.repository.js';
import {
  ViberRouteConfigSignal,
  type ViberRouteUpdatedSignal,
} from '../signals/viber-route-config.signals.js';

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
 * @description Read-through in-memory cache of route configs, invalidated in real-time via signals relayed by ViberSignalBroadcaster
 */
export class ViberRouteConfigCache {
  private logger = new Logger(ViberRouteConfigCache.name);
  private configMap: ConfigMap = new Map();
  // process route updated signals one at a time so they are applied in arrival order
  private limit = pLimit(1);

  constructor(private readonly routeConfigRepo: ViberRouteConfigRepository) {}

  @OnEvent(ViberRouteConfigSignal.RouteUpdated)
  async handleRouteUpdated(signal: ViberRouteUpdatedSignal) {
    await this.limit(async () => {
      try {
        await this.refresh(signal.type, signal.platformId);
      } catch (error: unknown) {
        this.logger.error('Failed to refresh viber route config', { signal }, error);
      }
    });
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
    const platformConfig =
      this.configMap.get(platformId) ?? new Map<RouteType, RoutableViberRouteConfig>();
    if (config) {
      platformConfig.set(routeType, config);
    } else {
      // route removed or no longer routable, evict stale entry
      platformConfig.delete(routeType);
    }
    this.configMap.set(platformId, platformConfig);
    return config ?? null;
  }
}
