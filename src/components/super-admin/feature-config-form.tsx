"use client";

import { useState } from "react";
import {
  LayoutDashboard, BookOpen, BookMarked, Sparkles, Library,
  Tag, FileText, Newspaper, Inbox, Mail, ShoppingBag,
  Paintbrush, Palette, Shield, Bot, Search, Settings, Save, Loader2, Globe,
} from "lucide-react";
import { DEFAULT_GATES, FEATURE_PLAN_MAP } from "@/lib/feature-gates";

// ── Feature list with icons ───────────────────────────────────────────────────

const FEATURES = [
  { key: "/admin/dashboard",    label: "Dashboard",      icon: LayoutDashboard },
  { key: "/admin/books",        label: "Books",           icon: BookOpen        },
  { key: "/admin/flip-books",   label: "Flip Books",      icon: BookMarked      },
  { key: "/admin/specials",     label: "Specials",        icon: Sparkles        },
  { key: "/admin/series",       label: "Series",          icon: Library         },
  { key: "/admin/genres",       label: "Genres",          icon: Tag             },
  { key: "/admin/pages",        label: "Custom Pages",    icon: FileText        },
  { key: "/admin/blog",         label: "Blog / News",     icon: Newspaper       },
  { key: "/admin/messages",     label: "Messages",        icon: Inbox           },
  { key: "/admin/newsletter",   label: "Newsletter",      icon: Mail            },
  { key: "/admin/sales",        label: "Sales",           icon: ShoppingBag     },
  { key: "/admin/appearance",   label: "Appearance",      icon: Paintbrush      },
  { key: "/admin/branding",     label: "Branding",        icon: Palette         },
  { key: "/admin/legal",        label: "My Site Legal",   icon: Shield          },
  { key: "/admin/ai-assistant", label: "AI Assistant",    icon: Bot             },
  { key: "/admin/seo-audit",    label: "SEO Audit",       icon: Search          },
  { key: "/admin/settings",     label: "Settings",        icon: Settings        },
];

const TIERS = ["FREE", "STANDARD", "PREMIUM", "DISABLED"] as const;

const TIER_STYLES: Record<string, { active: string; inactive: string; badge: string }> = {
  FREE: {
    active:   "bg-slate-100 text-slate-800 border-slate-400 ring-2 ring-slate-400 ring-offset-1",
    inactive: "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-50",
    badge:    "bg-slate-100 text-slate-700 border-slate-200",
  },
  STANDARD: {
    active:   "bg-blue-50 text-blue-800 border-blue-400 ring-2 ring-blue-400 ring-offset-1",
    inactive: "bg-white text-blue-400 border-blue-100 hover:border-blue-300 hover:bg-blue-50",
    badge:    "bg-blue-50 text-blue-700 border-blue-200",
  },
  PREMIUM: {
    active:   "bg-purple-50 text-purple-800 border-purple-400 ring-2 ring-purple-400 ring-offset-1",
    inactive: "bg-white text-purple-400 border-purple-100 hover:border-purple-300 hover:bg-purple-50",
    badge:    "bg-purple-50 text-purple-700 border-purple-200",
  },
  DISABLED: {
    active:   "bg-red-50 text-red-800 border-red-400 ring-2 ring-red-400 ring-offset-1",
    inactive: "bg-white text-red-300 border-red-100 hover:border-red-300 hover:bg-red-50",
    badge:    "bg-red-50 text-red-700 border-red-200",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export function FeatureConfigForm({ initialGates }: { initialGates: Record<string, string> }) {
  const [gates, setGates] = useState<Record<string, string>>({
    ...DEFAULT_GATES,
    ...initialGates,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState("");

  function setTier(key: string, tier: string) {
    setGates((prev) => ({ ...prev, [key]: tier }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/super-admin/feature-config", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ gates }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      setSaved(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Gates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Set the minimum plan tier required to access each admin menu item.
            Changes apply to all authors on next page load.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors flex-shrink-0"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      {/* Feedback */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
          ✓ Feature gates saved — changes are live for all authors.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Plan legend */}
      <div className="flex flex-wrap items-center gap-3">
        {(["FREE", "STANDARD", "PREMIUM"] as const).map((tier) => (
          <div
            key={tier}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${TIER_STYLES[tier].badge}`}
          >
            {tier}
          </div>
        ))}
        <span className="text-xs text-gray-400">— higher tiers inherit lower-tier access</span>
        <div className="h-4 w-px bg-gray-200" />
        <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${TIER_STYLES.DISABLED.badge}`}>
          DISABLED
        </div>
        <span className="text-xs text-gray-400">— hidden from all users including Premium</span>
        <div className="h-4 w-px bg-gray-200" />
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
          <Globe className="h-2.5 w-2.5" />
          Public site
        </span>
        <span className="text-xs text-gray-400">— also updates the public author site instantly</span>
      </div>

      {/* Feature rows */}
      <div className="space-y-2">
        {FEATURES.map(({ key, label, icon: Icon }) => {
          const current    = gates[key] ?? DEFAULT_GATES[key] ?? "FREE";
          const affectsPublic = !!FEATURE_PLAN_MAP[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3.5"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                    {affectsPublic && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <Globe className="h-2.5 w-2.5" />
                        Public site
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{key}</span>
                </div>
              </div>

              <div className="flex gap-1.5">
                {TIERS.map((tier) => {
                  const isSelected = current === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => setTier(key, tier)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected ? TIER_STYLES[tier].active : TIER_STYLES[tier].inactive
                      }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save (bottom) */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
