import { NextRequest } from "next/server";

// In-memory fallback for rate limiting (used when Redis/KV unavailable)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const inMemoryStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter with Redis fallback to in-memory storage.
 * Returns true if request is allowed, false if rate limit exceeded.
 */
export async function checkRateLimit(
  key: string,
  options: {
    maxRequests: number;
    windowSeconds: number;
  }
): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}> {
  const { maxRequests, windowSeconds } = options;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Try to use Vercel KV if available
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      return await checkRateLimitWithKV(key, maxRequests, windowSeconds);
    } catch (err) {
      console.warn("[rate-limit] KV check failed, falling back to in-memory:", err);
    }
  }

  // Fallback: in-memory rate limiting
  const entry = inMemoryStore.get(key) || { count: 0, resetTime: now + windowMs };

  // Reset if window expired
  if (now >= entry.resetTime) {
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }

  const allowed = entry.count < maxRequests;
  entry.count++;
  inMemoryStore.set(key, entry);

  return {
    allowed,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetTime,
  };
}

/**
 * Check rate limit using Vercel KV (Redis).
 * Uses INCR with EXPIRE for atomic counter management.
 */
async function checkRateLimitWithKV(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}> {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    throw new Error("KV credentials not configured");
  }

  // Use Redis INCR to atomically increment counter
  const incrResponse = await fetch(`${kvUrl}/incr/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kvToken}`,
    },
  });

  if (!incrResponse.ok) {
    throw new Error(`KV INCR failed: ${incrResponse.status}`);
  }

  const incrData = (await incrResponse.json()) as { result: number };
  const count = incrData.result;

  // Set expiration on first hit
  if (count === 1) {
    await fetch(`${kvUrl}/expire/${key}/${windowSeconds}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kvToken}`,
      },
    }).catch(() => {
      // Ignore expiration errors
    });
  }

  const now = Date.now();
  const resetAt = now + windowSeconds * 1000;
  const allowed = count <= maxRequests;

  return {
    allowed,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetAt,
  };
}

/**
 * Extract rate limit key from request.
 * For authenticated requests: use user ID
 * For public requests: use IP address
 */
export function getRateLimitKey(
  req: NextRequest,
  type: "user" | "ip",
  suffix?: string
): string {
  if (type === "user") {
    // Would need to extract from auth token if implementing per-user limits
    return `user:${suffix || "unknown"}`;
  }

  // Get client IP from headers (Vercel sets x-forwarded-for)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  return `ip:${ip}:${suffix || "global"}`;
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  checkout: {
    maxRequests: 50,
    windowSeconds: 60,
    description: "50 checkouts per minute per IP",
  },
  adminAPI: {
    maxRequests: 100,
    windowSeconds: 60,
    description: "100 admin requests per minute per user",
  },
  subscribe: {
    maxRequests: 10,
    windowSeconds: 60,
    description: "10 subscription requests per minute per user",
  },
  upload: {
    maxRequests: 20,
    windowSeconds: 60,
    description: "20 uploads per minute per user",
  },
  auth: {
    maxRequests: 5,
    windowSeconds: 900, // 15 minutes
    description: "5 auth attempts per 15 minutes per email",
  },
};
