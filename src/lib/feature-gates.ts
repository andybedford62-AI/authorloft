// Shared feature-gate logic used by the sidebar and the super-admin config UI.

export const TIER_RANK: Record<string, number> = {
  FREE:     0,
  STANDARD: 1,
  PREMIUM:  2,
  // DISABLED is not in TIER_RANK — it short-circuits before comparison.
};

// Default gates — mirrors the current hardcoded sidebar behaviour.
// These are used when no config has been saved yet, and as fallback keys.
export const DEFAULT_GATES: Record<string, string> = {
  "/admin/dashboard":    "FREE",
  "/admin/books":        "FREE",
  "/admin/flip-books":   "STANDARD",
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
