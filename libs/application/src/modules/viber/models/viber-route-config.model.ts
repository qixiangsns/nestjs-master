import { ViberAccount, ViberAccountBase } from './viber-account.model';
import { MessageType } from './viber-log.model';
import { Except } from 'type-fest';

export type RouteType = MessageType;
export const RouteType = MessageType;

export const RouteStrategy = ['RoundRobin', 'WeightRobin'] as const;
export type RouteStrategy = (typeof RouteStrategy)[number];

export interface RouteAccount {
  id: string;
  isEnabled: boolean;
  weight: number;
}

export type AccountDetailsRoutable = Except<ViberAccount, 'id' | 'name' | 'createdAt' | 'updatedAt'>;
export type AccountDetailsView = Except<ViberAccountBase, 'id'>;

/**
 * Route account populated with accounts details & credentials
 */
export interface RouteAccountRoutable extends RouteAccount {
  details: AccountDetailsRoutable;
}

/**
 * Route account populated with account summary (exclude credentials)
 */
export interface RouteAccountView extends RouteAccount {
  details: AccountDetailsView;
}

export interface ViberRouteConfig<Account extends RouteAccount = RouteAccount> {
  id: string;
  type: RouteType;
  platformId: string;
  senderId: string;
  strategy: RouteStrategy;
  accounts: Account[];
}

/**
 * Executable route config with account details & credentials ready for use
 * Usage: determine routable config for sending viber message
 */
export type RoutableViberRouteConfig = ViberRouteConfig<RouteAccountRoutable>;

/**
 * Route config with account details excluding sensitive information
 * Usage: show route config summary for admin
 */
export type ViberRouteConfigView = ViberRouteConfig<RouteAccountView>;
