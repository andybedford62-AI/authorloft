// Builds the list of live public pages for an author's site, matching the
// links shown in their site nav (see components/author-site/nav.tsx).

import type { ContentPresence } from "@/lib/author-queries";

export type HeroFocusType = "BOOKS" | "COURSES" | "MUSIC";

/**
 * Resolves what the homepage hero should showcase. A valid stored choice
 * always wins (even after the author gains a new content type later — no
 * silent auto-switch). A missing or stale choice (the stored type is no
 * longer published) falls through to the first available type in
 * Books > Courses > Music order, matching the existing isFeatured/heroBook
 * fallback precedent already used per-type. Returns null only when the
 * author has nothing published at all.
 */
export function resolveHeroFocus(
  storedHeroFocus: string | null | undefined,
  presence: ContentPresence
): HeroFocusType | null {
  const order: HeroFocusType[] = ["BOOKS", "COURSES", "MUSIC"];
  const available = order.filter((t) =>
    t === "BOOKS" ? presence.hasBooks : t === "COURSES" ? presence.hasCourses : presence.hasMusic
  );
  if (available.length === 0) return null;
  if (storedHeroFocus && available.includes(storedHeroFocus as HeroFocusType)) {
    return storedHeroFocus as HeroFocusType;
  }
  return available[0];
}

export interface AuthorSitePage {
  label: string;
  path: string;
}

export interface AuthorNavFlags {
  navShowAbout: boolean;
  navShowBooks: boolean;
  navShowSpecials: boolean;
  navShowFlipBooks: boolean;
  navShowBlog: boolean;
  navShowContact: boolean;
  navShowMediaKit: boolean;
  navShowCourses: boolean;
  navShowMusic: boolean;
  navShowBundles: boolean;
  plan?: { flipBooksLimit: number; mediaKitEnabled: boolean; coursesEnabled: boolean; bundlesEnabled: boolean; musicEnabled: boolean } | null;
}

export interface AuthorCustomPage {
  slug: string;
  title: string;
  navTitle: string | null;
}

export function getAuthorSitePages(
  author: AuthorNavFlags,
  customPages: AuthorCustomPage[] = []
): AuthorSitePage[] {
  const pages: AuthorSitePage[] = [{ label: "Home", path: "/" }];

  if (author.navShowBooks) pages.push({ label: "Books", path: "/books" });
  if (author.plan?.bundlesEnabled && author.navShowBundles) {
    // Bundles is now a tab on /books (see books-bundles-tabs.tsx), not its
    // own page -- link straight there instead of through the /bundles redirect.
    pages.push({ label: "Bundles", path: "/books?tab=bundles" });
  }
  if (author.plan?.coursesEnabled && author.navShowCourses) {
    pages.push({ label: "Courses", path: "/courses" });
  }
  if (author.plan?.musicEnabled && author.navShowMusic) {
    pages.push({ label: "Music", path: "/music" });
  }
  if (author.navShowSpecials) pages.push({ label: "Specials", path: "/specials" });
  if ((author.plan?.flipBooksLimit ?? 0) !== 0 && author.navShowFlipBooks) {
    pages.push({ label: "Flip Books", path: "/flip-books" });
  }
  if (author.navShowBlog) pages.push({ label: "News", path: "/blog" });

  for (const page of customPages) {
    pages.push({ label: page.navTitle || page.title, path: `/${page.slug}` });
  }

  if (author.navShowAbout) pages.push({ label: "About", path: "/about" });
  if (author.navShowContact) pages.push({ label: "Contact", path: "/contact" });
  if (author.plan?.mediaKitEnabled && author.navShowMediaKit) {
    // Media Kit is now a tab on /about (see about-media-kit-tabs.tsx), not
    // its own page -- link straight there instead of through the redirect.
    pages.push({ label: "Media Kit", path: "/about?tab=media-kit" });
  }

  return pages;
}

// ── Visibility, for the admin side ───────────────────────────────────────────

/** Public pages that have both an admin screen and a nav show/hide toggle. */
export type NavPageKey =
  | "books" | "bundles" | "courses" | "music" | "specials" | "flipBooks" | "blog";

export type NavPageVisibility = {
  visible: boolean;
  /** True when the plan itself excludes the feature — a different problem from
   *  the author having switched the menu item off, and a different fix. */
  planBlocked: boolean;
  label: string;
  path: string;
};

/**
 * Mirrors the conditions in getAuthorSitePages above so an admin screen can
 * tell the author their page is hidden. Kept in this file, next to the rules it
 * mirrors, because the two drifting apart is exactly how a gate ends up lying.
 */
export function getNavPageVisibility(
  author: AuthorNavFlags,
  key: NavPageKey
): NavPageVisibility {
  const plan = author.plan;
  switch (key) {
    case "books":
      return { visible: author.navShowBooks, planBlocked: false, label: "Books", path: "/books" };
    case "bundles":
      return {
        visible: !!plan?.bundlesEnabled && author.navShowBundles,
        planBlocked: !plan?.bundlesEnabled,
        label: "Bundles", path: "/books?tab=bundles",
      };
    case "courses":
      return {
        visible: !!plan?.coursesEnabled && author.navShowCourses,
        planBlocked: !plan?.coursesEnabled,
        label: "Courses", path: "/courses",
      };
    case "music":
      return {
        visible: !!plan?.musicEnabled && author.navShowMusic,
        planBlocked: !plan?.musicEnabled,
        label: "Music", path: "/music",
      };
    case "specials":
      return { visible: author.navShowSpecials, planBlocked: false, label: "Specials", path: "/specials" };
    case "flipBooks":
      return {
        visible: (plan?.flipBooksLimit ?? 0) !== 0 && author.navShowFlipBooks,
        planBlocked: (plan?.flipBooksLimit ?? 0) === 0,
        label: "Flip Books", path: "/flip-books",
      };
    case "blog":
      return { visible: author.navShowBlog, planBlocked: false, label: "News", path: "/blog" };
  }
}
