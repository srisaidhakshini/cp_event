// ===========================================
// RATE LIMITING UTILITY
// ===========================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter
 * @param identifier - Unique identifier (IP address or teamId)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limit exceeded, false otherwise
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 5, // 5 requests
  windowMs: number = 60000 // per 60 seconds
): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || entry.resetTime < now) {
    // New window or expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { limited: false, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    return { limited: true, remaining: 0, resetTime: entry.resetTime };
  }

  // Increment counter
  entry.count++;
  return { limited: false, remaining: limit - entry.count, resetTime: entry.resetTime };
}
