/**
 * Sliding Window In-Memory Rate Limiter for ReelDrop API routes.
 * Tracks requests per IP address or authorization token.
 */

interface RateLimitRecord {
  timestamps: number[];
}

class RateLimiter {
  private requests: Map<string, RateLimitRecord> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private cleanupIntervalMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.cleanupIntervalMs = 5 * 60 * 1000;

    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), this.cleanupIntervalMs);
    }
  }

  public check(identifier: string): {
    allowed: boolean;
    remaining: number;
    limit: number;
    resetMs: number;
  } {
    // Whitelist localhost development testing
    if (identifier === '127.0.0.1' || identifier === '::1' || identifier === 'localhost') {
      return { allowed: true, remaining: 999, limit: 999, resetMs: 0 };
    }

    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.requests.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.requests.set(identifier, record);
    }

    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldest = record.timestamps[0];
      const resetMs = Math.max(0, this.windowMs - (now - oldest));
      return {
        allowed: false,
        remaining: 0,
        limit: this.maxRequests,
        resetMs,
      };
    }

    record.timestamps.push(now);

    return {
      allowed: true,
      remaining: this.maxRequests - record.timestamps.length,
      limit: this.maxRequests,
      resetMs: this.windowMs,
    };
  }

  private cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, record] of this.requests.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.requests.delete(key);
      }
    }
  }
}

const defaultLimit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
const defaultWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

export const globalRateLimiter = new RateLimiter(defaultLimit, defaultWindow);
