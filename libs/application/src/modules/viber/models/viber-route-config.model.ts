import { ViberAccount } from '../models/viber-account.model';

export const RouteType = {
  OTP: 'OTP',
  MARKETING: 'MKT',
  NOTIFICATION: 'NOTIF',
} as const;
export const RouteTypes = Object.values(RouteType);

export const RouteStrategy = {
  ROUND_ROBIN: 'RB',
  WEIGHTED_ROUND_ROBIN: 'WRB',
} as const;
export const RouteStrategies = Object.values(RouteStrategy);

export type RouteType = (typeof RouteType)[keyof typeof RouteType];
export type RouteStrategy = (typeof RouteStrategy)[keyof typeof RouteStrategy];

export type RouteAccount = Pick<ViberAccount, 'authMethod' | 'credential' | 'providerCode'> & {
  isEnabled: string;
  weight: number;
};

export interface ViberRouteConfig {
  type: RouteType;
  platformId: string;
  strategy: RouteStrategy;
  accounts: RouteAccount[];
}
