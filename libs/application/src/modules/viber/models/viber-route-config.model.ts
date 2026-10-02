import { ViberAccount } from './viber-account.model';
import { MessageType } from './viber-log.model';
import { Except } from 'type-fest';

export type RouteType = MessageType;
export const RouteType = MessageType;

export const RouteStrategy = ['RoundRobin', 'WeightRobin'] as const;
export type RouteStrategy = (typeof RouteStrategy)[number];

export type RouteAccount = {
  id: string;
  isEnabled: boolean;
  weight: number;
};

export type RouteAccountDetails = RouteAccount & {
  accountDetails: Except<ViberAccount, 'id' | 'createdAt' | 'updatedAt'>;
};

export interface ViberRouteConfig {
  id: string;
  type: RouteType;
  platformId: string;
  senderId: string;
  strategy: RouteStrategy;
  accounts: RouteAccount[];
}

/**
 * Full route config with provider accounts
 */
export type ViberRouteConfigWithAccount = Except<ViberRouteConfig, 'accounts'> & {
  accounts: RouteAccountDetails[];
};
