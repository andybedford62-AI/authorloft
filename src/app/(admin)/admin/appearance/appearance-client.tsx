"use client";

import { useState } from "react";
import { Check, Loader2, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { BASE_THEMES, GENRE_PALETTES } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface AppearanceClientProps {
  currentTheme: string;
  authorSlug:   string;
  planTier:     string;
}

// ── Theme preview card ───────────────────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  locked,
  lockLabel,
  saving,
  onClick,
}: {
  theme: {
    id: string;
    name: string;
    description: string;
    preview: { bg: string; primary: string; accent: string };
    swatches?: string[];
    emoji?: string;
    mood?: string;
  };
  isActive:  boolean;
  locked:    boolean;
  lockLabel: string;
  saving:    boolean;
  onClick:   () => void;
}) {
  return (
    <div
      onClick={() => !locked && !saving && onClick()}
      className={cn(
        "relative rounded-2xl border-2 overflow-hidden transition-all",
        locked
          ? "border-gray-200 opacity-70 cursor-not-allowed"
          : isActive
            ? "border-blue-500 shadow-lg cursor-pointer"
            : "border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
      )}
    >
      {/* Preview */}
      <div className="h-36 w-full relative overflow-hidden" style={{ background: theme.preview.bg }}>
        {/* Fake nav */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: theme.preview.primary + "dd" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: theme.preview.accent }} />
            <div className="h-1.5 w-14 rounded opacity-80" style={{ background: theme.preview.bg }} />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-1.5 w-6 rounded opacity-40" style={{ background: theme.preview.bg }} />
            ))}
          </div>
        </div>
        {/* Fake hero content */}
        <div className="px-4 pt-3">
          <div className="h-3 w-3/4 rounded mb-2 opacity-85" style={{ background: theme.preview.primary }} />
          <div className="h-2 w-1/2 rounded mb-3 opacity-40" style={{ background: theme.preview.primary }} />
          <div className="h-6 w-20 rounded-lg" style={{ background: theme.preview.accent }} />
        </div>
        {/* Colour swatches strip for genre palettes */}
        {theme.swatches && (
          <div className="absolute bottom-0 left-0 right-0 flex h-5">
            {theme.swatches.slice(0, 9).map((c, i) => (
              <div key={i} className="flex-1" style={{ background: c }} />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-white">
        <div className="flex items-center justify-between mb-0.5">
          <h3 className="text-sm font-semibold text-gray-900">
            {theme.emoji ? `${theme.emoji} ` : ""}{theme.name}
          </h3>
          {isActive && !locked && (
            <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">{theme.mood || theme.description}</p>
      </div>

      {/* Active indicator */}
      {isActive && !locked && (
        <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center gap-1.5">
          <div className="w-9 h-9 rounded-full bg-gray-800/75 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-white bg-gray-800/75 px-2.5 py-0.5 rounded-full">
            {lockLabel}
          </span>
        </div>
      )}

      {/* Saving spinner */}
      {saving && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function AppearanceClient({
  currentTheme,
  authorSlug,
  planTier,
}: AppearanceClientProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [savingTheme,   setSavingTheme]   = useState<string | null>(null);
  const [error,         setError]         = useState("");

  const isFree     = planTier === "FREE";
  const isStandard = planTier === "STANDARD" || planTier === "PREMIUM";
  const isPremium  = planTier === "PREMIUM";

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const siteUrl        = `https://${authorSlug}.${platformDomain}`;

  async function handleSelectTheme(themeId: string) {
    if (themeId === selectedTheme) return;
    setSavingTheme(themeId);
    setError("");
    try {
      const res = await fetch("/api/admin/appearance", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ siteTheme: themeId }),
      });
      if (res.ok) {
        setSelectedTheme(themeId);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save theme.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSavingTheme(null);
    }
  }

  return (
    <div className="space-y-8">

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      {/* ── Website Themes ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900">Website Themes</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Sets the colour palette and typography across your entire site. Click to apply instantly.
            {isFree && (
              <span className="ml-1 text-amber-600 font-medium">
                Upgrade to Standard to unlock all themes.
              </span>
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {BASE_THEMES.map((theme) => {
            // FREE: only Modern Minimal is unlocked
            const locked = isFree && theme.id !== "modern-minimal";
            return (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={selectedTheme === theme.id}
                locked={locked}
                lockLabel="Upgrade to Standard"
                saving={savingTheme === theme.id}
                onClick={() => handleSelectTheme(theme.id)}
              />
            );
          })}
        </div>
      </section>

      {/* ── Genre Colour Palettes ────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            Genre Colour Palettes
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Premium
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            8 hand-crafted palettes designed for specific book genres — each with a complete colour system.
            {!isPremium && (
              <span className="ml-1 text-purple-600 font-medium">Available on Premium plans only.</span>
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GENRE_PALETTES.map((palette) => (
            <ThemeCard
              key={palette.id}
              theme={palette}
              isActive={selectedTheme === palette.id}
              locked={!isPremium}
              lockLabel="Upgrade to Premium"
              saving={savingTheme === palette.id}
              onClick={() => handleSelectTheme(palette.id)}
            />
          ))}
        </div>
      </section>

      {/* ── View live site ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          View your live site →
        </a>
        <span className="text-xs text-gray-400">Theme changes apply immediately to all visitors.</span>
      </div>

    </div>
  );
}
