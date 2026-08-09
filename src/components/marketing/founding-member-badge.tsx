import { Star } from "lucide-react";

/**
 * Distinct from AuthorBadges (achievement badges) — this is a manually
 * awarded status badge (Super Admin only), not metric-driven, so it gets
 * its own gold treatment rather than living in the achievements row.
 */
export function FoundingMemberBadge({ since }: { since?: Date | null }) {
  const label = since
    ? `Founding Member since ${new Date(since).getFullYear()}`
    : "Founding Member";

  return (
    <span
      title={label}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800"
    >
      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
      {label}
    </span>
  );
}
