import { LimiterRule } from './limiter.model';

/**
 * A shared limit pool, eg: one Promotexter credential used by both Viber and SMS accounts
 */
export interface LimiterPool {
  id: string;
  name: string;
  rules: LimiterRule[];
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
