import { NextRequest } from "next/server";
import { createClient } from "redis";

// ── Redis client (module-level singleton, reused across warm invocations) ──────
let _redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient(): Promise<ReturnType<typeof createClient> | null> {
  if (!process.env.REDIS_URL) return null;
  if (_redisClient && _redisClient.isOpen) return _redisClient;
  try {
    _redisClient = createClient({ url: process.env.REDIS_URL });
    _redisClient.on("error", () => { _redisClient = null; });
    await _redisClient.connect();
    return _redisClient;
  } catch {
    _redisClient = null;
    return null;
  }
}

// ── In-memory fallback ────────────────────────────────────────────────────────
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const inMemoryStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter. Tries Redis (REDIS_URL) first, falls back to in-memory.
 * Returns whether the request is allowed and remaining quota.
 */
export async function checkRateLimit(
  key: string,
  options: { maxRequests: number; windowSeconds: number }
): Promise<{ allowed: boolean; limit: number; remaining: number; resetAt: number }> {
  const { maxRequests, windowSeconds } = options;

  // Try Redis
  if (process.env.REDIS_URL) {
    try {
      return await checkRateLimitWithRedis(key, maxRequests, windowSeconds);
    } catch (err) {
      console.warn("[rate-limit] Redis check failed, falling back to in-memory:", err);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = inMemoryStore.get(key) || { count: 0, resetTime: now + windowMs };
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

async function checkRateLimitWithRedis(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; limit: number; remaining: number; resetAt: number }> {
  const client = await getRedisClient();
  if (!client) throw new Error("Redis client unavailable");

  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, windowSeconds);
  }

  return {
    allowed: count <= maxRequests,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetAt: Date.now() + windowSeconds * 1000,
  };
}

/**
 * Extract a rate-limit key from the request.
 * type "ip"   → keyed by client IP
 * type "user" → keyed by a supplied identifier (suffix)
 */
export function getRateLimitKey(
  req: NextRequest,
  type: "user" | "ip",
  suffix?: string
): string {
  if (type === "user") {
    return `rl:user:${suffix || "unknown"}`;
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `rl:ip:${ip}:${suffix || "global"}`;
}

/**
 * Common rate-limit configurations
 */
export const RATE_LIMITS = {
  checkout:  { maxRequests: 50,  windowSeconds: 60,  description: "50 checkouts per minute per IP" },
  adminAPI:  { maxRequests: 100, windowSeconds: 60,  description: "100 admin requests per minute per user" },
  subscribe: { maxRequests: 10,  windowSeconds: 60,  description: "10 subscription requests per minute" },
  upload:    { maxRequests: 20,  windowSeconds: 60,  description: "20 uploads per minute per user" },
  auth:      { maxRequests: 5,   windowSeconds: 900, description: "5 auth attempts per 15 minutes" },
};
