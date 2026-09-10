import type { createClient } from "redis";

// ── Redis client (module-level singleton, reused across warm invocations) ──────
// Shared by any module that wants a best-effort Redis connection (rate limiting,
// signed-URL caching, etc.) without each one re-implementing the same
// connect/circuit-breaker dance. Both imports below are type-only on purpose:
// `redis` is pulled in lazily so importing this module doesn't drag the whole
// package into every caller when REDIS_URL is unset (tests, local runs).
type RedisClient = ReturnType<typeof createClient>;
let _redisClient: RedisClient | null = null;

// Skip Redis entirely for a cooldown after a failed connect. Without this,
// every request re-pays the full connect-and-retry cost while Redis is down —
// on latency-sensitive paths that's worse than just using an in-memory fallback
// the moment we know Redis is unavailable.
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

export async function getRedisClient(): Promise<RedisClient | null> {
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

/** Test seam — lets suites reset the circuit breaker between cases. */
export function __resetRedisCircuitForTests(): void {
  _redisClient = null;
  _redisUnavailableUntil = 0;
}
