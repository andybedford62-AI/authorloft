// Source-level guard, deliberately not a rendering test: the bug this protects
// against is structural (metadata inherited from a layout), so reading the
// files catches it far more cheaply than booting every page component.
// @vitest-environment node

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";

const ROOT = join(process.cwd(), "src", "app", "(author-site)", "[domain]");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const pages = walk(ROOT).filter((f) => f.endsWith("page.tsx"));
const read = (f: string) => readFileSync(f, "utf8");
const rel = (f: string) => relative(ROOT, f).replace(/\\/g, "/");

/** A page is exempt if it only redirects, or a sibling layout marks it noindex. */
function exemptReason(file: string): string | null {
  const src = read(file);
  if (/redirect\(/.test(src) && !/export async function generateMetadata/.test(src)) {
    return "redirect-only";
  }
  try {
    const layout = read(join(dirname(file), "layout.tsx"));
    if (/index:\s*false/.test(layout)) return "noindex via sibling layout";
  } catch {
    /* no sibling layout */
  }
  return null;
}

describe("author-site canonical URLs", () => {
  it("finds the author-site pages to check", () => {
    expect(pages.length).toBeGreaterThan(15);
  });

  it("the [domain] layout must not set a canonical", () => {
    // The regression: Next merges layout metadata into every page beneath it,
    // so a canonical here cascades to every page that doesn't override it.
    // /about, /books, /contact and /flip-books all ended up declaring the site
    // root as their canonical while the sitemap submitted them as distinct
    // URLs, so Google refused to index them separately.
    const layout = read(join(ROOT, "layout.tsx"));
    expect(layout).not.toMatch(/alternates:\s*\{/);
  });

  it.each(pages.map((f) => [rel(f), f] as const))(
    "%s declares its own canonical or opts out of indexing",
    (_name, file) => {
      const exempt = exemptReason(file);
      if (exempt) {
        expect(exempt).toBeTruthy();
        return;
      }
      const src = read(file);
      const hasCanonical = /alternates:\s*\{\s*canonical:/.test(src);
      const isNoindex = /index:\s*false/.test(src);
      expect(
        hasCanonical || isNoindex,
        `${rel(file)} neither sets alternates.canonical nor robots.index=false — ` +
          `with no layout cascade it would ship without a canonical`,
      ).toBe(true);
    },
  );

  it("no page canonicalises to the bare site root except the home page", () => {
    // A canonical of exactly getAuthorBaseUrl(author) with nothing appended is
    // what the old cascade produced. Only [domain]/page.tsx should have one.
    const offenders = pages.filter((f) => {
      if (rel(f) === "page.tsx") return false;
      return /canonical:\s*getAuthorBaseUrl\(author\)\s*\}/.test(read(f));
    });
    expect(offenders.map(rel)).toEqual([]);
  });
});
