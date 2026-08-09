"use client";

import { useState } from "react";
import {
  Award, BookOpen, Library, BookMarked, DollarSign, TrendingUp, Trophy,
  Star, Sparkles, Mail, Users, FileCheck, Share2, Layers, Package,
  GraduationCap, Rocket, type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Award, BookOpen, Library, BookMarked, DollarSign, TrendingUp, Trophy,
  Star, Sparkles, Mail, Users, FileCheck, Share2, Layers, Package,
  GraduationCap, Rocket,
};

const METRIC_LABELS: Record<string, string> = {
  books: "Books Published",
  revenue: "Direct Sales Revenue ($)",
  reviews: "Reader Reviews",
  subscribers: "Newsletter Subscribers",
  arcReviews: "ARC Reviews Collected",
  affiliateSales: "Affiliate-Referred Sales",
  formats: "Distinct Sale Formats",
  bundles: "Published Bundles",
  courses: "Published Courses",
  preorders: "Pre-Order Signups",
};

// revenue is stored in cents; display/edit in dollars
const DOLLAR_METRICS = new Set(["revenue"]);

type Badge = {
  id: string;
  key: string;
  metric: string;
  label: string;
  description: string | null;
  icon: string;
  threshold: number;
  isActive: boolean;
  sortOrder: number;
};

export function BadgesClient({ initialBadges }: { initialBadges: Badge[] }) {
  const [badges, setBadges] = useState(initialBadges);
  const [savingId, setSavingId] = useState<string | null>(null);

  const grouped = badges.reduce<Record<string, Badge[]>>((acc, b) => {
    (acc[b.metric] ??= []).push(b);
    return acc;
  }, {});

  async function save(id: string, patch: Partial<Pick<Badge, "isActive" | "threshold">>) {
    setSavingId(id);
    const res = await fetch(`/api/super-admin/badges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setBadges((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    }
    setSavingId(null);
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([metric, defs]) => (
        <div key={metric} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700">{METRIC_LABELS[metric] ?? metric}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {defs.map((badge) => {
              const Icon = ICONS[badge.icon] ?? Award;
              const isDollar = DOLLAR_METRICS.has(badge.metric);
              const displayThreshold = isDollar ? badge.threshold / 100 : badge.threshold;

              return (
                <div key={badge.id} className="flex items-center gap-4 px-4 py-3">
                  <Icon className={`h-5 w-5 flex-shrink-0 ${badge.isActive ? "text-purple-600" : "text-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${badge.isActive ? "text-gray-900" : "text-gray-400"}`}>{badge.label}</p>
                    {badge.description && <p className="text-xs text-gray-400 mt-0.5">{badge.description}</p>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">{isDollar ? "$" : "≥"}</span>
                    <input
                      type="number"
                      defaultValue={displayThreshold}
                      disabled={savingId === badge.id}
                      onBlur={(e) => {
                        const raw = Number(e.target.value);
                        if (Number.isNaN(raw) || raw < 0) return;
                        const next = isDollar ? Math.round(raw * 100) : Math.round(raw);
                        if (next !== badge.threshold) save(badge.id, { threshold: next });
                      }}
                      className="w-24 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => save(badge.id, { isActive: !badge.isActive })}
                    disabled={savingId === badge.id}
                    role="switch"
                    aria-checked={badge.isActive}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${badge.isActive ? "bg-purple-600" : "bg-gray-200"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${badge.isActive ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
