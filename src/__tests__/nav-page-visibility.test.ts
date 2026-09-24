// getNavPageVisibility drives the "this page is hidden" banner on the admin
// catalog screens. It mirrors the rules in getAuthorSitePages, so these tests
// check the two AGREE — if they drift, the banner starts lying in one direction
// or the other, which is worse than not having it.
//
// getPublicNavLinks is what the live header and footer render. It shares the
// same rule (contentLinkState), and the "public menu agrees" block below pins
// that, since separate copies in nav.tsx / footer.tsx had drifted before.
// @vitest-environment node

import { describe, it, expect } from "vitest";
import {
  getAuthorSitePages,
  getNavPageVisibility,
  getPublicNavLinks,
  type AuthorNavFlags,
  type NavPageKey,
} from "@/lib/site-pages";
import type { ContentPresence } from "@/lib/author-queries";

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

const ALL_CONTENT: ContentPresence = { hasBooks: true, hasCourses: true, hasMusic: true };
const NO_CONTENT: ContentPresence = { hasBooks: false, hasCourses: false, hasMusic: false };

const KEYS: NavPageKey[] = ["books", "bundles", "courses", "music", "specials", "flipBooks", "blog"];

/** Does the admin site-pages view actually contain this page? */
function inNav(author: AuthorNavFlags, key: NavPageKey, presence = ALL_CONTENT): boolean {
  const { path } = getNavPageVisibility(ALL_ON, ALL_CONTENT, key);
  return getAuthorSitePages(author, presence).some((p) => p.path === path);
}

/** Does the live header/footer menu link to this page? */
function inPublicNav(author: AuthorNavFlags, key: NavPageKey, presence = ALL_CONTENT): boolean {
  const { path } = getNavPageVisibility(ALL_ON, ALL_CONTENT, key);
  return getPublicNavLinks(author, presence).some((l) => l.href === path);
}

describe("getNavPageVisibility agrees with the nav it mirrors", () => {
  it.each(KEYS)("%s: visible when everything is on", (key) => {
    expect(getNavPageVisibility(ALL_ON, ALL_CONTENT, key).visible).toBe(true);
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
    const v = getNavPageVisibility(author, ALL_CONTENT, key);
    expect(v.visible).toBe(false);
    expect(v.planBlocked).toBe(false); // toggle problem, not a plan problem
    expect(v.emptyBlocked).toBe(false);
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
    const v = getNavPageVisibility(author, ALL_CONTENT, key as NavPageKey);
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
      expect(getNavPageVisibility(author, ALL_CONTENT, key).planBlocked).toBe(false);
    },
  );
});

describe("Books / Courses / Music need published content", () => {
  it.each([
    ["books", { hasBooks: false }],
    ["courses", { hasCourses: false }],
    ["music", { hasMusic: false }],
  ] as const)("%s: toggle on + plan allows + nothing published → held back as emptyBlocked", (key, patch) => {
    const presence = { ...ALL_CONTENT, ...patch };
    const v = getNavPageVisibility(ALL_ON, presence, key);
    expect(v.visible).toBe(false);
    expect(v.emptyBlocked).toBe(true);
    expect(v.planBlocked).toBe(false);
    expect(inNav(ALL_ON, key, presence)).toBe(false);
    expect(inPublicNav(ALL_ON, key, presence)).toBe(false);
  });

  it("the plan problem wins over the empty problem (upgrade first, then publish)", () => {
    const author = { ...ALL_ON, plan: { ...ALL_ON.plan!, musicEnabled: false } } as AuthorNavFlags;
    const v = getNavPageVisibility(author, NO_CONTENT, "music");
    expect(v.planBlocked).toBe(true);
    expect(v.emptyBlocked).toBe(false);
  });

  it("a switched-off toggle is reported as the toggle, not as empty", () => {
    const author = { ...ALL_ON, navShowCourses: false } as AuthorNavFlags;
    expect(getNavPageVisibility(author, NO_CONTENT, "courses").emptyBlocked).toBe(false);
  });

  it.each(["bundles", "specials", "flipBooks", "blog"] as const)(
    "%s is not content-gated (out of scope for this rule)",
    (key) => {
      const v = getNavPageVisibility(ALL_ON, NO_CONTENT, key);
      expect(v.visible).toBe(true);
      expect(v.emptyBlocked).toBe(false);
    },
  );
});

describe("the public menu agrees with the admin view", () => {
  // Bundles and Media Kit are tabs on Books/About, not menu links.
  const LINKED: NavPageKey[] = ["books", "courses", "music", "specials", "flipBooks", "blog"];

  const authors: [string, AuthorNavFlags][] = [
    ["all on", ALL_ON],
    ["books off", { ...ALL_ON, navShowBooks: false }],
    ["music off", { ...ALL_ON, navShowMusic: false }],
    ["no courses in plan", { ...ALL_ON, plan: { ...ALL_ON.plan!, coursesEnabled: false } }],
    ["no music in plan", { ...ALL_ON, plan: { ...ALL_ON.plan!, musicEnabled: false } }],
    ["no plan", { ...ALL_ON, plan: null }],
  ];
  const presences: [string, ContentPresence][] = [
    ["everything published", ALL_CONTENT],
    ["nothing published", NO_CONTENT],
    ["music only", { hasBooks: false, hasCourses: false, hasMusic: true }],
  ];

  for (const [aName, author] of authors) {
    for (const [pName, presence] of presences) {
      it.each(LINKED)(`${aName} / ${pName}: %s link matches getNavPageVisibility`, (key) => {
        expect(inPublicNav(author, key, presence)).toBe(
          getNavPageVisibility(author, presence, key).visible
        );
      });
    }
  }

  it("regression: a plan without courses never gets a Courses link (header used to skip this check)", () => {
    const author = { ...ALL_ON, plan: { ...ALL_ON.plan!, coursesEnabled: false } } as AuthorNavFlags;
    expect(inPublicNav(author, "courses")).toBe(false);
  });

  it("regression: a plan without music never gets a Music link (footer used to skip this check)", () => {
    const author = { ...ALL_ON, plan: { ...ALL_ON.plan!, musicEnabled: false } } as AuthorNavFlags;
    expect(inPublicNav(author, "music")).toBe(false);
  });

  it("keeps Home first, custom pages before About/Contact, and no Bundles/Media Kit links", () => {
    const links = getPublicNavLinks(ALL_ON, ALL_CONTENT, [{ slug: "faq", title: "FAQ", navTitle: null }]);
    expect(links.map((l) => l.label)).toEqual([
      "Home", "Books", "Courses", "Music", "Specials", "Flip Books", "News", "FAQ", "About", "Contact",
    ]);
  });
});

describe("labels and paths", () => {
  it("points bundles and blog at where they actually live", () => {
    // Bundles is a tab on /books, and the public blog page is labelled "News".
    expect(getNavPageVisibility(ALL_ON, ALL_CONTENT, "bundles").path).toBe("/books?tab=bundles");
    expect(getNavPageVisibility(ALL_ON, ALL_CONTENT, "blog").label).toBe("News");
  });
});
