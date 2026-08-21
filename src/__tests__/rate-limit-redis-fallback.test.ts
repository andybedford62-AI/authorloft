import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { checkRateLimit, __resetRedisCircuitForTests } from "@/lib/rate-limit";

// Port chosen to be closed on the test machine, so connect() fails fast with
// ECONNREFUSED — the realistic "Redis is down but REDIS_URL is still set" case.
const UNREACHABLE_REDIS = "redis://127.0.0.1:6399";

describe("checkRateLimit — Redis unreachable", () => {
  const original = process.env.REDIS_URL;

  beforeEach(() => {
    process.env.REDIS_URL = UNREACHABLE_REDIS;
    __resetRedisCircuitForTests();
  });

  afterEach(() => {
    if (original === undefined) delete process.env.REDIS_URL;
    else process.env.REDIS_URL = original;
    __resetRedisCircuitForTests();
  });

  it("falls back to in-memory instead of hanging", async () => {
    const started = Date.now();
    const res = await checkRateLimit("rl:test:fallback", { maxRequests: 3, windowSeconds: 60 });
    const elapsed = Date.now() - started;

    // The bug this guards: with node-redis defaults, connect() never settles
    // and this call hangs forever rather than degrading to in-memory.
    expect(elapsed).toBeLessThan(4000);
    expect(res.allowed).toBe(true);
    expect(res.limit).toBe(3);
    expect(res.remaining).toBe(2);
  });

  it("still enforces the limit while degraded", async () => {
    const key = "rl:test:degraded";
    const results = [];
    for (let i = 0; i < 4; i++) {
      results.push(await checkRateLimit(key, { maxRequests: 3, windowSeconds: 60 }));
    }

    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[3].remaining).toBe(0);
  });

  it("does not re-pay connect cost on every call (circuit breaker holds)", async () => {
    await checkRateLimit("rl:test:warm", { maxRequests: 10, windowSeconds: 60 });

    const started = Date.now();
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("rl:test:warm", { maxRequests: 10, windowSeconds: 60 });
    }
    const elapsed = Date.now() - started;

    // Once the breaker is open these should be pure in-memory work.
    expect(elapsed).toBeLessThan(100);
  });
});
