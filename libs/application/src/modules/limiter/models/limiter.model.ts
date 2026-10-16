export const LimiterWindow = ['Second'] as const;
export type LimiterWindow = (typeof LimiterWindow)[number];

/**
 * Duration of each window in seconds
 */
export const LimiterWindowSeconds: Record<LimiterWindow, number> = {
  Second: 1,
};

/**
 * Max points allowed within a window
 * @example { window: 'Second', limit: 50 } // 50 QPS
 */
export interface LimiterRule {
  window: LimiterWindow;
  limit: number;
}

/**
 * One Redis counter per pool per window, counts the messages sent in the current window
 *
 * @example { key: '6ad07126b6b0d62d3eb5357b:Second', rule: { window: 'Second', limit: 50 } }
 */
export interface LimiterCounter {
  key: string;
  rule: LimiterRule;
}

export interface LimiterGrant {
  allowed: boolean;
  retryAfterMs: number;
}
