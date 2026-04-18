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
  "/admin/books":        "FREE",
  "/admin/flip-books":   "PREMIUM",   // premium-only from day one
  "/admin/specials":     "FREE",
  "/admin/series":       "FREE",
  "/admin/genres":       "FREE",
  "/admin/pages":        "STANDARD",
  "/admin/blog":         "FREE",
  "/admin/messages":     "FREE",
  "/admin/newsletter":   "STANDARD",
  "/admin/sales":        "STANDARD",
  "/admin/appearance":   "STANDARD",
  "/admin/branding":     "FREE",
  "/admin/legal":        "FREE",
  "/admin/ai-assistant": "PREMIUM",
  "/admin/seo-audit":    "PREMIUM",
  "/admin/settings":     "FREE",
};

// Features that map to a Plan model field.
// When Feature Gates saves, these cascade to every Plan record so the
// public author site stays in sync with the admin gate setting.
export const FEATURE_PLAN_MAP: Record<
  string,
  { field: string; enabledValue: number | boolean; disabledValue: number | boolean } | null
> = {
  "/admin/flip-books": { field: "flipBooksLimit", enabledValue: -1,   disabledValue: 0     },
  "/admin/sales":      { field: "salesEnabled",   enabledValue: true,  disabledValue: false },
  "/admin/newsletter": { field: "newsletter",     enabledValue: true,  disabledValue: false },
  // Admin-only — no public-site Plan field to update:
  "/admin/dashboard":    null,
  "/admin/books":        null,
  "/admin/specials":     null,
  "/admin/series":       null,
  "/admin/genres":       null,
  "/admin/pages":        null,
  "/admin/blog":         null,
  "/admin/messages":     null,
  "/admin/appearance":   null,
  "/admin/branding":     null,
  "/admin/legal":        null,
  "/admin/ai-assistant": null,
  "/admin/seo-audit":    null,
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
