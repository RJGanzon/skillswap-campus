/**
 * Simple in-memory rate limiter for Next.js
 * Suitable for single-instance deployments
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  isLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    entry.count++;
    return entry.count > this.maxRequests;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}

// Create default limiters for different endpoints
export const authLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 min
export const registerLimiter = new RateLimiter(60 * 60 * 1000, 3); // 3 attempts per hour
export const apiLimiter = new RateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 min

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(limiter: RateLimiter, identifier: string): boolean {
  return limiter.isLimited(identifier);
}

/**
 * Get client IP from request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}
