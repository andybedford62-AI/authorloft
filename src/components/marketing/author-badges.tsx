import {
  Award, BookOpen, Library, BookMarked, DollarSign, TrendingUp, Trophy,
  Star, Sparkles, Mail, Users, FileCheck, Share2, Layers, Package,
  GraduationCap, Rocket, type LucideIcon,
} from "lucide-react";
import type { EarnedBadge } from "@/lib/badges";

const ICONS: Record<string, LucideIcon> = {
  Award, BookOpen, Library, BookMarked, DollarSign, TrendingUp, Trophy,
  Star, Sparkles, Mail, Users, FileCheck, Share2, Layers, Package,
  GraduationCap, Rocket,
};

function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Award;
}

/** Compact badge pills for an author's public pages (Bookstore, author-site About). */
export function AuthorBadges({ badges, accentColor }: { badges: EarnedBadge[]; accentColor?: string }) {
  if (badges.length === 0) return null;
  const accent = accentColor || "#C26A4A";

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const Icon = getIcon(badge.icon);
        return (
          <span
            key={badge.key}
            title={badge.description ?? badge.label}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
            style={{ color: accent, borderColor: `${accent}40`, background: `${accent}10` }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
