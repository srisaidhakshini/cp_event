import RateLimit from "@/models/RateLimit.model";

// ===========================================
// RATE LIMITING UTILITY (MongoDB + TTL)
// ===========================================

/**
 * MongoDB-backed rate limiter with TTL
 * @param identifier - Unique identifier (IP address or teamId)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000
): Promise<{ limited: boolean; remaining: number; resetTime: number }> {
  const now = Date.now();
  const expiresAt = new Date(now + windowMs);

  const record = await RateLimit.findOne({ key: identifier });

  // New window or expired (TTL may not have deleted yet)
  if (!record || record.expiresAt.getTime() < now) {
    await RateLimit.findOneAndUpdate(
      { key: identifier },
      {
        key: identifier,
        count: 1,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    return {
      limited: false,
      remaining: limit - 1,
      resetTime: expiresAt.getTime(),
    };
  }

  // Limit exceeded
  if (record.count >= limit) {
    return {
      limited: true,
      remaining: 0,
      resetTime: record.expiresAt.getTime(),
    };
  }

  // Increment counter
  record.count += 1;
  await record.save();

  return {
    limited: false,
    remaining: limit - record.count,
    resetTime: record.expiresAt.getTime(),
  };
}
