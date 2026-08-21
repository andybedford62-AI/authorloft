import { describe, it, expect, vi } from "vitest";
import { checkLoginRateLimit } from "@/lib/login-rate-limit";

// The limiter keys its in-memory buckets by email, so each test isolates itself
// by using an address no other test touches. That's cheaper and far more stable
// than re-importing the module per test: a per-test `vi.resetModules()` forced a
// fresh resolve of the whole dependency graph inside every `it()`, which is what
// made this file time out under the load of the full parallel suite.
describe("checkLoginRateLimit", () => {
  it("allows the first 5 attempts for an email", async () => {
    for (let i = 0; i < 5; i++) {
      expect(await checkLoginRateLimit("first@example.com")).toBe(true);
    }
  });

  it("blocks the 6th attempt within the window", async () => {
    for (let i = 0; i < 5; i++) await checkLoginRateLimit("blocked@example.com");
    expect(await checkLoginRateLimit("blocked@example.com")).toBe(false);
  });

  it("treats emails case-insensitively", async () => {
    for (let i = 0; i < 5; i++) await checkLoginRateLimit("Case@Example.COM");
    expect(await checkLoginRateLimit("case@example.com")).toBe(false);
  });

  it("does not share limits across different emails", async () => {
    for (let i = 0; i < 5; i++) await checkLoginRateLimit("a@example.com");
    expect(await checkLoginRateLimit("b@example.com")).toBe(true);
  });

  it("allows attempts again after the window expires", async () => {
    vi.useFakeTimers();
    try {
      for (let i = 0; i < 5; i++) await checkLoginRateLimit("time@example.com");
      expect(await checkLoginRateLimit("time@example.com")).toBe(false);

      // Advance past the 15-minute window
      vi.advanceTimersByTime(16 * 60 * 1000);
      expect(await checkLoginRateLimit("time@example.com")).toBe(true);
    } finally {
      // Restore even if an assertion throws, so fake timers can't leak into
      // whatever runs next in this worker.
      vi.useRealTimers();
    }
  });
});
