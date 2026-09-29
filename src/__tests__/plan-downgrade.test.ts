import { describe, it, expect, vi } from "vitest";

// plan-downgrade.ts imports prisma and the mailer at module load; the functions
// under test here are pure, so stub both to keep this a plain unit test.
vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/mailer", () => ({ sendPlanGraceEmail: vi.fn() }));

import {
  GRACE_DAYS,
  limitsFromPlan,
  selectExcess,
  selectRestorable,
  decideGraceAction,
  isCustomDomainSuspendedFor,
  type PlanLike,
} from "@/lib/plan-downgrade";

const DAY = 24 * 60 * 60 * 1000;
const t0 = new Date("2026-10-01T00:00:00Z");
const plus = (days: number) => new Date(t0.getTime() + days * DAY);

const FREE: PlanLike = {
  maxBooks: 5, maxPosts: 50, maxCourses: 5, maxMusicLists: 5,
  coursesEnabled: true, musicEnabled: true, flipBooksLimit: 0, customDomain: false,
};
const PREMIUM: PlanLike = {
  maxBooks: null, maxPosts: null, maxCourses: null, maxMusicLists: null,
  coursesEnabled: true, musicEnabled: true, flipBooksLimit: -1, customDomain: true,
};

describe("limitsFromPlan", () => {
  it("maps Free plan limits, treating flipBooksLimit 0 as none", () => {
    expect(limitsFromPlan(FREE)).toEqual({ books: 5, courses: 5, music: 5, posts: 50, flipBooks: 0 });
  });

  it("maps unlimited (null / -1) to null", () => {
    expect(limitsFromPlan(PREMIUM)).toEqual({ books: null, courses: null, music: null, posts: null, flipBooks: null });
  });

  it("treats a disabled feature as a limit of zero even when a max is set", () => {
    const limits = limitsFromPlan({ ...FREE, coursesEnabled: false, musicEnabled: false });
    expect(limits.courses).toBe(0);
    expect(limits.music).toBe(0);
  });
});

describe("selectExcess", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g"];

  it("keeps the first N (keep order) and returns the rest", () => {
    expect(selectExcess(items, 5)).toEqual(["f", "g"]);
  });

  it("returns nothing when within the limit or unlimited", () => {
    expect(selectExcess(items, 7)).toEqual([]);
    expect(selectExcess(items, 10)).toEqual([]);
    expect(selectExcess(items, null)).toEqual([]);
  });

  it("returns everything when the limit is zero (feature not on the plan)", () => {
    expect(selectExcess(items, 0)).toEqual(items);
  });
});

describe("selectRestorable", () => {
  const hidden = ["x", "y", "z"];

  it("restores only what fits under the new limit", () => {
    expect(selectRestorable(hidden, 20, 19)).toEqual(["x"]);
    expect(selectRestorable(hidden, 20, 10)).toEqual(hidden);
  });

  it("restores nothing when already at the limit", () => {
    expect(selectRestorable(hidden, 5, 5)).toEqual([]);
    expect(selectRestorable(hidden, 5, 9)).toEqual([]);
  });

  it("restores everything on an unlimited plan", () => {
    expect(selectRestorable(hidden, null, 100)).toEqual(hidden);
  });
});

describe("decideGraceAction", () => {
  const base = { startedAt: null, endsAt: null, stage: 0, now: t0 };

  it("does nothing when there is no violation and no grace period", () => {
    expect(decideGraceAction({ ...base, hasViolation: false })).toBe("none");
  });

  it("clears an active grace period once the author is back within limits", () => {
    expect(decideGraceAction({ hasViolation: false, startedAt: t0, endsAt: plus(GRACE_DAYS), stage: 2, now: plus(10) })).toBe("clear");
  });

  it("starts a grace period on a new violation", () => {
    expect(decideGraceAction({ ...base, hasViolation: true })).toBe("start");
  });

  it("stays quiet early in the grace period", () => {
    expect(decideGraceAction({ hasViolation: true, startedAt: t0, endsAt: plus(GRACE_DAYS), stage: 1, now: plus(5) })).toBe("none");
  });

  it("sends the mid reminder at day 14, once", () => {
    const input = { hasViolation: true, startedAt: t0, endsAt: plus(GRACE_DAYS) };
    expect(decideGraceAction({ ...input, stage: 1, now: plus(14) })).toBe("remind-mid");
    expect(decideGraceAction({ ...input, stage: 2, now: plus(15) })).toBe("none");
  });

  it("sends the final reminder at day 27, once", () => {
    const input = { hasViolation: true, startedAt: t0, endsAt: plus(GRACE_DAYS) };
    expect(decideGraceAction({ ...input, stage: 2, now: plus(27) })).toBe("remind-final");
    expect(decideGraceAction({ ...input, stage: 3, now: plus(28) })).toBe("none");
  });

  it("jumps straight to the final reminder if the mid one was missed", () => {
    expect(decideGraceAction({ hasViolation: true, startedAt: t0, endsAt: plus(GRACE_DAYS), stage: 1, now: plus(28) })).toBe("remind-final");
  });

  it("applies the limits at the deadline and on every run after it", () => {
    const input = { hasViolation: true, startedAt: t0, endsAt: plus(GRACE_DAYS) };
    expect(decideGraceAction({ ...input, stage: 3, now: plus(GRACE_DAYS) })).toBe("apply");
    expect(decideGraceAction({ ...input, stage: 4, now: plus(GRACE_DAYS + 20) })).toBe("apply");
  });
});

describe("isCustomDomainSuspendedFor", () => {
  const ended = plus(GRACE_DAYS);

  it("keeps the domain during the grace period", () => {
    expect(isCustomDomainSuspendedFor({ customDomain: "a.com", planAllowsCustomDomain: false, graceEndsAt: ended, now: plus(10) })).toBe(false);
  });

  it("suspends the domain after the grace period on a plan without custom domains", () => {
    expect(isCustomDomainSuspendedFor({ customDomain: "a.com", planAllowsCustomDomain: false, graceEndsAt: ended, now: plus(31) })).toBe(true);
  });

  it("never suspends when the plan includes custom domains", () => {
    expect(isCustomDomainSuspendedFor({ customDomain: "a.com", planAllowsCustomDomain: true, graceEndsAt: ended, now: plus(31) })).toBe(false);
  });

  it("never suspends without a grace period or without a custom domain", () => {
    expect(isCustomDomainSuspendedFor({ customDomain: "a.com", planAllowsCustomDomain: false, graceEndsAt: null, now: plus(31) })).toBe(false);
    expect(isCustomDomainSuspendedFor({ customDomain: null, planAllowsCustomDomain: false, graceEndsAt: ended, now: plus(31) })).toBe(false);
  });
});
