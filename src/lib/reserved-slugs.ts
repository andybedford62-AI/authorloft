/**
 * Author site slugs (subdomains) that can't be claimed — either because they
 * collide with platform infrastructure (www, api, cdn) or with real marketing
 * routes (pricing, blog, login).
 *
 * Shared so every path that assigns a slug enforces the same list: the
 * availability check the register form calls, the register API itself, and the
 * change-site-URL settings route.
 */
export const RESERVED_SLUGS = [
  "www", "app", "admin", "api", "cdn", "mail", "static", "blog",
  "help", "support", "about", "pricing", "login", "register",
  "dashboard", "superadmin", "authorloft",
  // Present on the marketing site but missing from the original list
  "news", "guides", "features", "bookstore", "contact", "faq",
  "resources", "compare", "terms", "privacy", "gdpr", "demo",
  "staging", "ingest", "assets", "auth", "orders", "arc",
];

export type SlugProblem = "too_short" | "too_long" | "invalid" | "reserved";

/**
 * Validates an already-slugified string. Returns null when it's usable.
 * Does NOT check uniqueness — callers hit the database for that.
 */
export function validateSlug(slug: string): SlugProblem | null {
  if (!slug || slug.length < 3) return "too_short";
  if (slug.length > 40) return "too_long";
  if (RESERVED_SLUGS.includes(slug)) return "reserved";
  // Must start and end alphanumeric; hyphens allowed in between
  if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug)) return "invalid";
  return null;
}

export function slugProblemMessage(problem: SlugProblem): string {
  switch (problem) {
    case "too_short": return "Site URL must be at least 3 characters.";
    case "too_long":  return "Site URL must be 40 characters or fewer.";
    case "reserved":  return "That site URL is reserved. Please choose another.";
    case "invalid":   return "Site URL may only contain lowercase letters, numbers, and hyphens.";
  }
}
