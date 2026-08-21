import type { NextRequest } from "next/server";
import type { createClient } from "redis";

// ── Redis client (module-level singleton, reused across warm invocations) ──────
// Both imports above are type-only on purpose: `NextRequest` is just an
// annotation, and the `redis` client is pulled in lazily below. Importing
// either eagerly drags Next's server runtime and the whole redis package into
// every module that touches rate limiting — needless work when REDIS_URL is
// unset (tests, local runs) and the in-memory fallback is all that's used.
type RedisClient = ReturnType<typeof createClient>;
let _redisClient: RedisClient | null = null;

// Skip Redis entirely for a cooldown after a failed connect. Without this,
// every request re-pays the full connect-and-retry cost while Redis is down —
// on checkout/register that latency is worse than just using the in-memory
// fallback the moment we know Redis is unavailable.
const REDIS_COOLDOWN_MS = 30_000;
let _redisUnavailableUntil = 0;

// node-redis retries forever by default, which means `await connect()` against
// an unreachable host NEVER settles — the catch below becomes dead code and the
// documented in-memory fallback never runs, hanging the request instead.
// Verified against redis@5: default options never settle; these reject in ~140ms.
const REDIS_SOCKET_OPTIONS = {
  connectTimeout: 2_000,
  reconnectStrategy: (retries: number): number | Error =>
    retries >= 2 ? new Error("Redis unreachable") : Math.min((retries + 1) * 100, 500),
};

async function getRedisClient(): Promise<RedisClient | null> {
  if (!process.env.REDIS_URL) return null;
  if (_redisClient && _redisClient.isOpen) return _redisClient;
  if (Date.now() < _redisUnavailableUntil) return null;
  try {
    const { createClient: create } = await import("redis");
    _redisClient = create({ url: process.env.REDIS_URL, socket: REDIS_SOCKET_OPTIONS });
    _redisClient.on("error", () => { _redisClient = null; });
    await _redisClient.connect();
    return _redisClient;
  } catch {
    _redisClient = null;
    _redisUnavailableUntil = Date.now() + REDIS_COOLDOWN_MS;
    return null;
  }
}

/** Test seam — lets the suite reset the circuit breaker between cases. */
export function __resetRedisCircuitForTests(): void {
  _redisClient = null;
  _redisUnavailableUntil = 0;
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
