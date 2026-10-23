type PacerOptions = {
  minDelayMs: number; // Max speed (immediate)
  maxDelayMs: number; // Min speed (slowest backoff)
  initialBackoffMs: number; // Initial
  backoffFactor: number;
};

/**
 *
 */
export class Pacer {
  private options: PacerOptions;
  private currentDelayMs: number;

  constructor(options: PacerOptions) {
    this.options = options;
    this.currentDelayMs = options.minDelayMs || 0;
  }

  /**
   * 🚀 Immediate recovery (reducing wait time to zero)
   */
  rampUp() {
    this.currentDelayMs = this.options.minDelayMs;
  }

  /**
   * 🟡 Gradually slow down process (increasing wait time with backoff factor until max delay is met)
   */
  slowDown() {
    if (this.currentDelayMs === this.options.minDelayMs) {
      this.currentDelayMs = this.options.initialBackoffMs;
    } else {
      this.currentDelayMs = Math.min(
        this.currentDelayMs * this.options.backoffFactor,
        this.options.maxDelayMs,
      );
    }
  }

  /**
   * 🔴 Throttle process with a fixed delay (when rate limit is exceeded)
   */
  throttle(delayMs: number) {
    this.currentDelayMs = Math.min(delayMs, this.options.maxDelayMs);
  }

  wait() {
    if (this.currentDelayMs === 0) {
      return new Promise((resolve) => setImmediate(resolve));
    }
    return new Promise((resolve) => setTimeout(resolve, this.currentDelayMs));
  }
}
