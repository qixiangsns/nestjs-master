import { RoutableViberRouteConfig } from '../models/viber-route-config.model';

export const ViberRouteConfigTopic = {
  RouteUpdated: 'viber.config.updated',
} as const satisfies Record<string, `viber.${string}`>;

export type ViberRouteUpdatedPayload = RoutableViberRouteConfig;
