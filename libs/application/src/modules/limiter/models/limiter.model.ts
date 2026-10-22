export const LimiterWindow = ['Second'] as const;
export type LimiterWindow = (typeof LimiterWindow)[number];

/**
 * Duration of each window in seconds
 */
export const LimiterWindowSeconds: Record<LimiterWindow, number> = {
  Second: 1,
};

/**
 * Who shares a rule's counter
 * - Shared: one counter for all pods
 * - IpExclusive: one counter per egress IP, each pod's IP gets the full limit
 */
export const LimiterStrategy = ['Shared', 'IpExclusive'] as const;
export type LimiterStrategy = (typeof LimiterStrategy)[number];

/**
 * Max points allowed within a window
 * @example { window: 'Second', limit: 50, strategy: 'Shared' } // 50 QPS across all pods
 * @example { window: 'Second', limit: 50, strategy: 'IpExclusive' } // 50 QPS per egress IP
 */
export interface LimiterRule {
  window: LimiterWindow;
  limit: number;
  strategy: LimiterStrategy;
}

/**
 * One Redis counter per pool per window, counts the messages sent in the current window
 *
 * @example { key: 'pool-id:6ad07126b6b0d62d3eb5357b:Second', rule: { window: 'Second', limit: 50, strategy: 'Shared' } }
 * @example { key: 'pool-id:6ad07126b6b0d62d3eb5357b:Second:Ip:211.24.90.131', rule: { window: 'Second', limit: 50, strategy: 'IpExclusive' } }
 */
export interface LimiterCounter {
  key: string;
  rule: LimiterRule;
}

export interface LimiterGrant {
  allowed: boolean;
  retryAfterMs: number;
}
