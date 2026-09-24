// The rules for which pages an author's site links to. getPublicNavLinks feeds
// the public header and footer; getAuthorSitePages and getNavPageVisibility are
// the admin views of the same rules (contentLinkState is shared by all three).

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

/** The three catalog types whose menu link also needs something published. */
type ContentNavKey = "books" | "courses" | "music";

/**
 * THE rule for the Books / Courses / Music menu links, used by the public nav,
 * the footer and every admin view of them:
 *
 *   plan allows it (Courses, Music)  AND  the author's toggle is on
 *                                    AND  at least one item is published
 *
 * The content check exists so a site never links to an empty page — e.g. a
 * music list created then deleted (the create route switches the toggle on,
 * nothing ever switches it back off), or a new author who hasn't published a
 * book yet. The toggle still wins in the other direction: authors can hide a
 * section they have content for.
 */
function contentLinkState(author: AuthorNavFlags, presence: ContentPresence, key: ContentNavKey) {
  const plan = author.plan;
  const planBlocked =
    key === "courses" ? !plan?.coursesEnabled : key === "music" ? !plan?.musicEnabled : false;
  const toggleOn =
    key === "books" ? author.navShowBooks : key === "courses" ? author.navShowCourses : author.navShowMusic;
  const hasContent =
    key === "books" ? presence.hasBooks : key === "courses" ? presence.hasCourses : presence.hasMusic;
  return { visible: !planBlocked && toggleOn && hasContent, planBlocked, toggleOn, hasContent };
}

export interface PublicNavLink {
  label: string;
  href: string;
}

/**
 * Links for the author site's header menu (Home first) — the footer uses the
 * same list minus Home. One builder for both, because separate copies in
 * nav.tsx and footer.tsx had already drifted (the footer skipped the plan
 * checks on Courses and Music; the header skipped it on Courses).
 *
 * Bundles and Media Kit are deliberately absent: they're tabs on Books and
 * About now (books-bundles-tabs.tsx / about-media-kit-tabs.tsx), not links.
 */
export function getPublicNavLinks(
  author: AuthorNavFlags,
  presence: ContentPresence,
  customPages: AuthorCustomPage[] = []
): PublicNavLink[] {
  const links: PublicNavLink[] = [{ label: "Home", href: "/" }];

  if (contentLinkState(author, presence, "books").visible)   links.push({ label: "Books",   href: "/books" });
  if (contentLinkState(author, presence, "courses").visible) links.push({ label: "Courses", href: "/courses" });
  if (contentLinkState(author, presence, "music").visible)   links.push({ label: "Music",   href: "/music" });
  if (author.navShowSpecials) links.push({ label: "Specials", href: "/specials" });
  if ((author.plan?.flipBooksLimit ?? 0) !== 0 && author.navShowFlipBooks) {
    links.push({ label: "Flip Books", href: "/flip-books" });
  }
  if (author.navShowBlog) links.push({ label: "News", href: "/blog" });

  for (const page of customPages) {
    links.push({ label: page.navTitle || page.title, href: `/${page.slug}` });
  }

  if (author.navShowAbout)   links.push({ label: "About",   href: "/about" });
  if (author.navShowContact) links.push({ label: "Contact", href: "/contact" });

  return links;
}

export function getAuthorSitePages(
  author: AuthorNavFlags,
  presence: ContentPresence,
  customPages: AuthorCustomPage[] = []
): AuthorSitePage[] {
  const pages: AuthorSitePage[] = [{ label: "Home", path: "/" }];

  if (contentLinkState(author, presence, "books").visible) pages.push({ label: "Books", path: "/books" });
  if (author.plan?.bundlesEnabled && author.navShowBundles) {
    // Bundles is now a tab on /books (see books-bundles-tabs.tsx), not its
    // own page -- link straight there instead of through the /bundles redirect.
    pages.push({ label: "Bundles", path: "/books?tab=bundles" });
  }
  if (contentLinkState(author, presence, "courses").visible) {
    pages.push({ label: "Courses", path: "/courses" });
  }
  if (contentLinkState(author, presence, "music").visible) {
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
  /** Books/Courses/Music only: plan allows it and the toggle is on, but nothing
   *  is published yet, so the link is held back. The fix is to publish, not to
   *  flip a toggle that's already on. */
  emptyBlocked: boolean;
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
  presence: ContentPresence,
  key: NavPageKey
): NavPageVisibility {
  const plan = author.plan;
  const content = (k: ContentNavKey, label: string, path: string): NavPageVisibility => {
    const st = contentLinkState(author, presence, k);
    return {
      visible: st.visible,
      planBlocked: st.planBlocked,
      emptyBlocked: !st.planBlocked && st.toggleOn && !st.hasContent,
      label, path,
    };
  };
  switch (key) {
    case "books":
      return content("books", "Books", "/books");
    case "bundles":
      return {
        visible: !!plan?.bundlesEnabled && author.navShowBundles,
        planBlocked: !plan?.bundlesEnabled, emptyBlocked: false,
        label: "Bundles", path: "/books?tab=bundles",
      };
    case "courses":
      return content("courses", "Courses", "/courses");
    case "music":
      return content("music", "Music", "/music");
    case "specials":
      return { visible: author.navShowSpecials, planBlocked: false, emptyBlocked: false, label: "Specials", path: "/specials" };
    case "flipBooks":
      return {
        visible: (plan?.flipBooksLimit ?? 0) !== 0 && author.navShowFlipBooks,
        planBlocked: (plan?.flipBooksLimit ?? 0) === 0, emptyBlocked: false,
        label: "Flip Books", path: "/flip-books",
      };
    case "blog":
      return { visible: author.navShowBlog, planBlocked: false, emptyBlocked: false, label: "News", path: "/blog" };
  }
}
