import { RoutableViberRouteConfig } from '../models/viber-route-config.model';

export const ViberRouteConfigSignal = {
  RouteUpdated: 'viber.config.updated',
} as const satisfies Record<string, `viber.${string}`>;

export type ViberRouteUpdatedSignal = RoutableViberRouteConfig;
