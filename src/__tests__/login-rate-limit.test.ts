import { describe, it, expect, beforeEach, vi } from "vitest";

// Isolate each test suite from module-level Map state by re-importing fresh
describe("checkLoginRateLimit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("allows the first 5 attempts for an email", async () => {
    const { checkLoginRateLimit } = await import("@/lib/login-rate-limit");
    for (let i = 0; i < 5; i++) {
      expect(checkLoginRateLimit("user@example.com")).toBe(true);
    }
  });

  it("blocks the 6th attempt within the window", async () => {
    const { checkLoginRateLimit } = await import("@/lib/login-rate-limit");
    for (let i = 0; i < 5; i++) checkLoginRateLimit("blocked@example.com");
    expect(checkLoginRateLimit("blocked@example.com")).toBe(false);
  });

  it("treats emails case-insensitively", async () => {
    const { checkLoginRateLimit } = await import("@/lib/login-rate-limit");
    for (let i = 0; i < 5; i++) checkLoginRateLimit("User@Example.COM");
    expect(checkLoginRateLimit("user@example.com")).toBe(false);
  });

  it("does not share limits across different emails", async () => {
    const { checkLoginRateLimit } = await import("@/lib/login-rate-limit");
    for (let i = 0; i < 5; i++) checkLoginRateLimit("a@example.com");
    expect(checkLoginRateLimit("b@example.com")).toBe(true);
  });

  it("allows attempts again after the window expires", async () => {
    vi.useFakeTimers();
    const { checkLoginRateLimit } = await import("@/lib/login-rate-limit");
    for (let i = 0; i < 5; i++) checkLoginRateLimit("time@example.com");
    expect(checkLoginRateLimit("time@example.com")).toBe(false);

    // Advance past the 15-minute window
    vi.advanceTimersByTime(16 * 60 * 1000);
    expect(checkLoginRateLimit("time@example.com")).toBe(true);
    vi.useRealTimers();
  });
});
