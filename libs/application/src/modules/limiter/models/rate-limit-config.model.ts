export const PoolType = ['Provider'] as const;
export type PoolType = (typeof PoolType)[number];

export interface RateLimitConfig {
  id: string;
  name: string;
  maxRequestPerSecond: number | null;
  maxRequestPerMinute: number | null;
  maxRequestPerHour: number | null;
  maxRequestPerDay: number | null;
  type: PoolType;
}
