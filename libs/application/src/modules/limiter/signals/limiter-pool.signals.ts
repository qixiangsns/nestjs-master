export const LimiterPoolSignal = {
  PoolUpdated: 'limiter.pool.updated',
} as const satisfies Record<string, `limiter.${string}`>;

export type LimiterPoolUpdatedSignal = {
  poolId: string;
};
