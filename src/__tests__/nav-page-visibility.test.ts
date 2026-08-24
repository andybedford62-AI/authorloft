// getNavPageVisibility drives the "this page is hidden" banner on the admin
// catalog screens. It mirrors the rules in getAuthorSitePages, so these tests
// check the two AGREE — if they drift, the banner starts lying in one direction
// or the other, which is worse than not having it.
// @vitest-environment node

import { describe, it, expect } from "vitest";
import {
  getAuthorSitePages,
  getNavPageVisibility,
  type AuthorNavFlags,
  type NavPageKey,
} from "@/lib/site-pages";

const ALL_ON: AuthorNavFlags = {
  navShowAbout: true, navShowBooks: true, navShowSpecials: true,
  navShowFlipBooks: true, navShowBlog: true, navShowContact: true,
  navShowMediaKit: true, navShowCourses: true, navShowBundles: true,
  navShowMusic: true,
  plan: {
    flipBooksLimit: 5, mediaKitEnabled: true,
    coursesEnabled: true, bundlesEnabled: true, musicEnabled: true,
  },
};

const KEYS: NavPageKey[] = ["books", "bundles", "courses", "music", "specials", "flipBooks", "blog"];

/** Does the real nav actually contain this page? */
function inNav(author: AuthorNavFlags, key: NavPageKey): boolean {
  const { path } = getNavPageVisibility(ALL_ON, key);
  return getAuthorSitePages(author).some((p) => p.path === path);
}

describe("getNavPageVisibility agrees with the nav it mirrors", () => {
  it.each(KEYS)("%s: visible when everything is on", (key) => {
    expect(getNavPageVisibility(ALL_ON, key).visible).toBe(true);
    expect(inNav(ALL_ON, key)).toBe(true);
  });

  it.each([
    ["books", "navShowBooks"],
    ["bundles", "navShowBundles"],
    ["courses", "navShowCourses"],
    ["music", "navShowMusic"],
    ["specials", "navShowSpecials"],
    ["flipBooks", "navShowFlipBooks"],
    ["blog", "navShowBlog"],
  ] as const)("%s: hidden when its toggle is off, and gone from the nav too", (key, flag) => {
    const author = { ...ALL_ON, [flag]: false } as AuthorNavFlags;
    const v = getNavPageVisibility(author, key);
    expect(v.visible).toBe(false);
    expect(v.planBlocked).toBe(false); // toggle problem, not a plan problem
    expect(inNav(author, key)).toBe(false);
  });
});

describe("plan-gated pages report the plan, not the toggle", () => {
  it.each([
    ["courses", { coursesEnabled: false }],
    ["music", { musicEnabled: false }],
    ["bundles", { bundlesEnabled: false }],
    ["flipBooks", { flipBooksLimit: 0 }],
  ] as const)("%s: planBlocked when the plan excludes it", (key, planPatch) => {
    const author = { ...ALL_ON, plan: { ...ALL_ON.plan!, ...planPatch } } as AuthorNavFlags;
    const v = getNavPageVisibility(author, key as NavPageKey);
    expect(v.visible).toBe(false);
    // Telling someone to flip a switch their plan doesn't offer sends them in
    // a circle, so the banner must be able to tell these apart.
    expect(v.planBlocked).toBe(true);
    expect(inNav(author, key as NavPageKey)).toBe(false);
  });

  it.each(["books", "specials", "blog"] as const)(
    "%s is never plan-blocked (no plan gate exists for it)",
    (key) => {
      const author = { ...ALL_ON, plan: null } as AuthorNavFlags;
      expect(getNavPageVisibility(author, key).planBlocked).toBe(false);
    },
  );
});

describe("labels and paths", () => {
  it("points bundles and blog at where they actually live", () => {
    // Bundles is a tab on /books, and the public blog page is labelled "News".
    expect(getNavPageVisibility(ALL_ON, "bundles").path).toBe("/books?tab=bundles");
    expect(getNavPageVisibility(ALL_ON, "blog").label).toBe("News");
  });
});
