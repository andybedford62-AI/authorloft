// Shared feature-gate logic used by the sidebar, super-admin UI, and cascade API.

export const TIER_RANK: Record<string, number> = {
  FREE:     0,
  STANDARD: 1,
  PREMIUM:  2,
  // DISABLED is not in TIER_RANK — it short-circuits before comparison.
};

// Default gates — used when no config has been saved yet.
export const DEFAULT_GATES: Record<string, string> = {
  "/admin/dashboard":    "FREE",
  "/admin/arcs":         "STANDARD",
  "/admin/books":        "FREE",
  "/admin/flip-books":   "PREMIUM",   // premium-only from day one
  "/admin/specials":     "FREE",
  "/admin/series":       "FREE",
  "/admin/genres":       "FREE",
  "/admin/pages":        "STANDARD",
  "/admin/blog":         "FREE",
  "/admin/messages":     "FREE",
  "/admin/feedback":     "FREE",
  "/admin/newsletter":   "FREE",
  "/admin/sales":        "STANDARD",
  "direct-sales":        "FREE",      // gates Plan.salesEnabled (eBook-only on FREE; all formats on STANDARD+)
  "bookstore-listing":   "FREE",      // gates Plan.bookstoreListingEnabled (AuthorLoft Bookstore opt-in)
  "pre-orders":          "STANDARD",  // gates Plan.preOrdersEnabled (Coming Soon / pre-order books)
  "/admin/bundles":      "STANDARD",
  "/admin/courses":      "STANDARD",
  "/admin/appearance":   "STANDARD",
  "/admin/branding":     "FREE",
  "/admin/legal":        "FREE",
  "/admin/ai-assistant": "PREMIUM",
  "/admin/seo-audit":    "PREMIUM",
  "/admin/promote":      "STANDARD",
  "/admin/settings":     "FREE",
  "/admin/media-kit":    "STANDARD",
};

// Features that map to a Plan model field.
// When Feature Gates saves, these cascade to every Plan record so the
// public author site stays in sync with the admin gate setting.
export const FEATURE_PLAN_MAP: Record<
  string,
  { field: string; enabledValue: number | boolean; disabledValue: number | boolean } | null
> = {
  "/admin/flip-books": { field: "flipBooksLimit",   enabledValue: -1,   disabledValue: 0     },
  "direct-sales":      { field: "salesEnabled",    enabledValue: true,  disabledValue: false },
  "/admin/newsletter": { field: "newsletter",      enabledValue: true,  disabledValue: false },
  "/admin/media-kit":  { field: "mediaKitEnabled", enabledValue: true,  disabledValue: false },
  "bookstore-listing": { field: "bookstoreListingEnabled", enabledValue: true, disabledValue: false },
  "pre-orders":        { field: "preOrdersEnabled", enabledValue: true, disabledValue: false },
  "/admin/bundles":    { field: "bundlesEnabled",   enabledValue: true, disabledValue: false },
  "/admin/courses":    { field: "coursesEnabled",   enabledValue: true, disabledValue: false },
  // Admin-only — no public-site Plan field to update:
  "/admin/arcs":         null,
  "/admin/dashboard":    null,
  "/admin/books":        null,
  "/admin/sales":        null,
  "/admin/specials":     null,
  "/admin/series":       null,
  "/admin/genres":       null,
  "/admin/pages":        null,
  "/admin/blog":         null,
  "/admin/messages":     null,
  "/admin/feedback":     null,
  "/admin/appearance":   null,
  "/admin/branding":     null,
  "/admin/legal":        null,
  "/admin/ai-assistant": null,
  "/admin/seo-audit":    null,
  "/admin/promote":      null,
  "/admin/settings":     null,
};

/**
 * Returns true when a user on `planTier` can access `featureKey`.
 * "DISABLED" hides the feature from everyone regardless of tier.
 * Uses saved gates first, falling back to DEFAULT_GATES, then FREE.
 */
export function canAccessFeature(
  featureKey: string,
  planTier: string,
  gates: Record<string, string>,
): boolean {
  const required = gates[featureKey] ?? DEFAULT_GATES[featureKey] ?? "FREE";
  if (required === "DISABLED") return false;
  return (TIER_RANK[planTier] ?? 0) >= (TIER_RANK[required] ?? 0);
}
