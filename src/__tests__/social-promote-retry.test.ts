import { describe, it, expect, vi } from "vitest";

// generate.ts pulls in Prisma/Sentry at import time; only the pure helper is under test.
vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@sentry/nextjs", () => ({ captureException: () => {} }));

import { isTransientAiError } from "@/lib/social-promote/generate";

describe("isTransientAiError", () => {
  it("retries Google's busy answers", () => {
    // Verbatim from the Sept 24 2026 staging failures.
    expect(isTransientAiError(new Error(
      "[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent: [503 Service Unavailable] This model is currently experiencing high demand."
    ))).toBe(true);
    expect(isTransientAiError(new Error("[429 Too Many Requests] RESOURCE_EXHAUSTED"))).toBe(true);
  });

  it("does not retry real failures", () => {
    expect(isTransientAiError(new Error("[400 Bad Request] API key not valid"))).toBe(false);
    expect(isTransientAiError(new Error("Model returned empty output"))).toBe(false);
  });
});
