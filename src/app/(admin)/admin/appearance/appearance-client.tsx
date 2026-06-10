"use client";

import { useState } from "react";
import { Check, Loader2, Lock, Sparkles, CheckCircle2, Palette, RotateCcw } from "lucide-react";
import { BASE_THEMES, GENRE_PALETTES, SUBGENRE_PALETTES } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface AppearanceClientProps {
  currentTheme:        string;
  currentTemplate:     string;
  authorSlug:          string;
  planTier:            string;
  currentCustomAccent: string | null;
}

const TEMPLATES = [
  {
    id:          "classic",
    name:        "Classic",
    tagline:     "Author First",
    description: "Hero banner → large author bio with photo → books → series.",
    badges:      ["Hero banner", "Author bio", "Books grid", "Series"],
    diagram: [
      { label: "HERO BANNER",  h: 28, dark: true,   accent: false },
      { label: "Author Bio",   h: 22, dark: false,  accent: false },
      { label: "Books",        h: 20, dark: false,  accent: true  },
      { label: "Series",       h: 14, dark: false,  accent: false },
    ],
  },
  {
    id:          "minimal",
    name:        "Minimal",
    tagline:     "Books First",
    description: "Slim author header → books catalog leads → bio below.",
    badges:      ["No hero banner", "Books catalog first", "Compact bio", "Series"],
    diagram: [
      { label: "Author Header", h: 16, dark: false, accent: false },
      { label: "Books Catalog", h: 36, dark: false, accent: true  },
      { label: "Bio",           h: 14, dark: false, accent: false },
      { label: "Series",        h: 12, dark: false, accent: false },
    ],
  },
  {
    id:          "bold",
    name:        "Bold",
    tagline:     "Book Spotlight",
    description: "Hero banner → author strip → one featured book spotlight → grid.",
    badges:      ["Hero banner", "Dark author strip", "Featured spotlight", "Books grid"],
    diagram: [
      { label: "HERO BANNER",    h: 22, dark: true,   accent: false },
      { label: "Author Strip",   h: 14, dark: true,   accent: false },
      { label: "★ SPOTLIGHT",    h: 26, dark: true,   accent: true  },
      { label: "More Books",     h: 16, dark: false,  accent: false },
    ],
  },
  {
    id:          "cinematic",
    name:        "🎬 Cinematic",
    tagline:     "Editorial",
    description: "Full-bleed portrait hero, press strip, featured release, editorial layout.",
    badges:      ["Portrait hero", "Press strip", "Featured release", "About section"],
    isPremium:   true,
    diagram: [
      { label: "PORTRAIT HERO",   h: 36, dark: true,   accent: true  },
      { label: "Press Strip",     h: 10, dark: true,   accent: false },
      { label: "Featured Release",h: 22, dark: true,   accent: false },
      { label: "Books + About",   h: 14, dark: true,   accent: false },
    ],
  },
] as const;

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
  currentTemplate,
  authorSlug,
  planTier,
  currentCustomAccent,
}: AppearanceClientProps) {
  const [selectedTheme,    setSelectedTheme]    = useState(currentTheme);
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);
  const [savingTheme,      setSavingTheme]      = useState<string | null>(null);
  const [savingTemplate,   setSavingTemplate]   = useState<string | null>(null);
  const [error,            setError]            = useState("");

  // Custom accent (Premium)
  const [customAccent,     setCustomAccent]     = useState<string>(currentCustomAccent ?? "#C0392B");
  const [accentEnabled,    setAccentEnabled]    = useState<boolean>(!!currentCustomAccent);
  const [savingAccent,     setSavingAccent]     = useState(false);
  const [accentSaved,      setAccentSaved]      = useState(false);

  const isFree     = planTier === "FREE";
  const isStandard = planTier === "STANDARD" || planTier === "PREMIUM";
  const isPremium  = planTier === "PREMIUM";

  async function saveCustomAccent(value: string | null) {
    setSavingAccent(true);
    setAccentSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/appearance", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ customAccentColor: value }),
      });
      if (res.ok) {
        setAccentSaved(true);
        setTimeout(() => setAccentSaved(false), 2500);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save accent colour.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSavingAccent(false);
    }
  }

  function handleClearAccent() {
    setAccentEnabled(false);
    saveCustomAccent(null);
  }

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

  async function handleSelectTemplate(templateId: string) {
    if (templateId === selectedTemplate) return;
    setSavingTemplate(templateId);
    setError("");
    try {
      const res = await fetch("/api/admin/appearance", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ homeTemplate: templateId }),
      });
      if (res.ok) {
        setSelectedTemplate(templateId);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save template.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSavingTemplate(null);
    }
  }

  return (
    <div className="space-y-8">

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      {/* ── Page Structure ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900">Page Structure</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Controls which sections appear on your homepage and in what order. Click to apply instantly.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((tmpl) => {
            const locked    = "isPremium" in tmpl && tmpl.isPremium && !isPremium;
            const isActive  = selectedTemplate === tmpl.id;
            const isSaving  = savingTemplate === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => !locked && !isSaving && handleSelectTemplate(tmpl.id)}
                className={cn(
                  "relative rounded-2xl border-2 overflow-hidden transition-all",
                  locked
                    ? "border-gray-200 opacity-70 cursor-not-allowed"
                    : isActive
                      ? "border-blue-500 shadow-lg cursor-pointer"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
                )}
              >
                {/* Structural diagram */}
                <div className="h-36 w-full bg-gray-100 p-2 flex flex-col gap-1 relative">
                  {tmpl.diagram.map((row, i) => (
                    <div
                      key={i}
                      className="w-full rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        height:          `${row.h * (100 / tmpl.diagram.reduce((s, r) => s + r.h, 0))}%`,
                        backgroundColor: row.accent ? "#3b82f620" : row.dark ? "#1f2937" : "#e5e7eb",
                        border:          row.accent ? "1px solid #3b82f640" : "none",
                      }}
                    >
                      <span
                        className="text-[8px] font-bold uppercase tracking-widest truncate px-1"
                        style={{ color: row.accent ? "#3b82f6" : row.dark ? "#9ca3af" : "#9ca3af" }}
                      >
                        {row.label}
                      </span>
                    </div>
                  ))}
                  {isActive && !locked && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {isSaving && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>

                {/* Card info */}
                <div className="p-3 bg-white">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight">{tmpl.name}</h3>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mt-0.5">{tmpl.tagline}</p>
                    </div>
                    {isActive && !locked && (
                      <span className="flex items-center gap-1 text-xs text-blue-600 font-medium flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  {/* Badge pills */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tmpl.badges.map((badge) => (
                      <span
                        key={badge}
                        className={cn(
                          "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                          badge.startsWith("No ") || badge === "Compact bio"
                            ? "bg-gray-100 text-gray-400"
                            : "bg-blue-50 text-blue-600"
                        )}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {locked && (
                  <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-gray-800/75 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white bg-gray-800/75 px-2 py-0.5 rounded-full">
                      Upgrade to Premium
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tip separator */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
          <span className="text-base leading-none mt-0.5">💡</span>
          <p className="text-xs text-amber-800">
            <strong>Page Structure</strong> controls which sections appear and their order.{" "}
            <strong>Colour Theme</strong> below controls how they look. Mix any combination freely.
          </p>
        </div>
      </section>

      {/* ── Colour Theme ────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900">Colour Theme</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Sets the colour palette across your entire site. Works with any page structure above. Click to apply instantly.
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
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Standard +
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            8 hand-crafted palettes designed for specific book genres — each with a complete colour system.
            {isFree && (
              <span className="ml-1 text-blue-600 font-medium">Available on Standard and Premium plans.</span>
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GENRE_PALETTES.map((palette) => (
            <ThemeCard
              key={palette.id}
              theme={palette}
              isActive={selectedTheme === palette.id}
              locked={isFree}
              lockLabel="Upgrade to Standard"
              saving={savingTheme === palette.id}
              onClick={() => handleSelectTheme(palette.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Subgenre Palettes ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            Subgenre Palettes
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Standard +
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Specialised palettes for niche subgenres — for flying adventures, underwater stories, and more. Each ships with a curated default hero image.
            {isFree && (
              <span className="ml-1 text-blue-600 font-medium">Available on Standard and Premium plans.</span>
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SUBGENRE_PALETTES.map((palette) => (
            <ThemeCard
              key={palette.id}
              theme={palette}
              isActive={selectedTheme === palette.id}
              locked={isFree}
              lockLabel="Upgrade to Standard"
              saving={savingTheme === palette.id}
              onClick={() => handleSelectTheme(palette.id)}
            />
          ))}
        </div>
      </section>

      {/* ── Custom Accent Colour (Premium) ───────────────────────────────────── */}
      <section className="relative bg-white rounded-xl border border-gray-200 p-6 space-y-5 overflow-hidden">
        <div>
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-400" />
            Custom Accent Colour
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Premium
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Override your theme&apos;s accent with any colour you like — applied to buttons, links, and highlights across your whole site.
            {!isPremium && (
              <span className="ml-1 text-purple-600 font-medium">Available on Premium plans only.</span>
            )}
          </p>
        </div>

        {isPremium && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Colour swatch + native picker */}
              <label className="relative cursor-pointer">
                <span
                  className="block w-16 h-16 rounded-xl border border-gray-200 shadow-sm"
                  style={{ backgroundColor: accentEnabled ? customAccent : "#e5e7eb" }}
                />
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => {
                    setCustomAccent(e.target.value);
                    setAccentEnabled(true);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label="Pick accent colour"
                />
              </label>

              {/* Hex input */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-600">Hex value</label>
                <input
                  type="text"
                  value={customAccent}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomAccent(v.startsWith("#") ? v : `#${v}`);
                    setAccentEnabled(true);
                  }}
                  placeholder="#C0392B"
                  className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={7}
                />
              </div>

              {/* Save / clear */}
              <div className="flex items-center gap-2 pt-5">
                <button
                  type="button"
                  disabled={savingAccent || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(customAccent)}
                  onClick={() => { setAccentEnabled(true); saveCustomAccent(customAccent); }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {savingAccent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Apply Colour
                </button>
                {accentEnabled && (
                  <button
                    type="button"
                    disabled={savingAccent}
                    onClick={handleClearAccent}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    title="Revert to theme accent"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Use theme accent
                  </button>
                )}
              </div>
            </div>

            {accentSaved && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Saved — your site now uses this accent.
              </p>
            )}
            <p className="text-xs text-gray-400">
              Your custom colour stays applied even if you switch themes. Clear it any time to return to the theme&apos;s built-in accent.
            </p>
          </div>
        )}

        {/* Lock overlay for non-Premium */}
        {!isPremium && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
            <div className="w-11 h-11 rounded-full bg-gray-800/80 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white bg-gray-800/80 px-3 py-1 rounded-full">
              Upgrade to Premium
            </span>
          </div>
        )}
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
