"use client";

import { useState } from "react";
import { Check, Loader2, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATES, type TemplateId } from "@/lib/templates";
import { BASE_THEMES, GENRE_PALETTES, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface AppearanceClientProps {
  currentTemplate: string;
  currentTheme:    string;
  authorSlug:      string;
  planTier:        string;
}

// ── Template thumbnails ──────────────────────────────────────────────────────

function ClassicThumbnail({ active }: { active: boolean }) {
  const accent = active ? "#2563EB" : "#94a3b8";
  return (
    <svg viewBox="0 0 200 140" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="200" height="52" fill={accent} rx="4" />
      <rect x="12" y="12" width="80" height="6" rx="2" fill="white" opacity="0.9" />
      <rect x="12" y="24" width="55" height="4" rx="2" fill="white" opacity="0.5" />
      <rect x="12" y="34" width="40" height="10" rx="3" fill="white" opacity="0.85" />
      <rect x="140" y="8" width="24" height="36" rx="2" fill="white" opacity="0.3" />
      <rect x="168" y="14" width="20" height="30" rx="2" fill="white" opacity="0.2" />
      <rect x="12" y="60" width="70" height="5" rx="2" fill="#1f2937" />
      <rect x="12" y="70" width="100" height="3" rx="1" fill="#9ca3af" />
      <rect x="12" y="76" width="85" height="3" rx="1" fill="#9ca3af" />
      <circle cx="168" cy="76" r="20" fill="#e5e7eb" />
      <rect x="12" y="100" width="176" height="12" rx="2" fill="#f9fafb" />
      <rect x="12" y="116" width="176" height="12" rx="2" fill="#f9fafb" />
    </svg>
  );
}

function MinimalThumbnail({ active }: { active: boolean }) {
  const accent = active ? "#2563EB" : "#94a3b8";
  return (
    <svg viewBox="0 0 200 140" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="200" height="140" fill="white" rx="4" />
      <rect x="0" y="0" width="200" height="140" fill="none" stroke="#e5e7eb" strokeWidth="1" rx="4" />
      <rect x="12" y="14" width="16" height="2" rx="1" fill={accent} />
      <circle cx="170" cy="36" r="16" fill="#f3f4f6" />
      <rect x="12" y="22" width="90" height="9" rx="2" fill="#111827" />
      <rect x="12" y="36" width="55" height="3" rx="1" fill="#9ca3af" />
      <rect x="12" y="60" width="50" height="10" rx="3" fill={accent} opacity="0.85" />
      <rect x="66" y="60" width="60" height="10" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <rect x="0" y="90" width="200" height="50" fill="#f9fafb" />
      <rect x="12" y="96" width="36" height="26" rx="2" fill="#e5e7eb" />
      <rect x="56" y="96" width="36" height="26" rx="2" fill="#e5e7eb" />
      <rect x="100" y="96" width="36" height="26" rx="2" fill="#e5e7eb" />
      <rect x="144" y="96" width="36" height="26" rx="2" fill="#e5e7eb" />
    </svg>
  );
}

function BoldThumbnail({ active }: { active: boolean }) {
  const accent = active ? "#2563EB" : "#64748b";
  return (
    <svg viewBox="0 0 200 140" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="200" height="80" fill="#0f172a" rx="4" />
      <ellipse cx="150" cy="40" rx="60" ry="40" fill={accent} opacity="0.15" />
      <rect x="12" y="14" width="30" height="3" rx="1" fill={accent} opacity="0.9" />
      <rect x="12" y="22" width="85" height="12" rx="2" fill="white" opacity="0.95" />
      <rect x="12" y="38" width="60" height="4" rx="1" fill="white" opacity="0.4" />
      <rect x="12" y="46" width="45" height="10" rx="3" fill={accent} />
      <rect x="130" y="6" width="32" height="48" rx="3" fill="#1e293b" />
      <rect x="132" y="8" width="28" height="44" rx="2" fill={accent} opacity="0.3" />
      <rect x="0" y="80" width="200" height="20" fill="#1e293b" />
      <circle cx="20" cy="90" r="7" fill="#374151" />
      <rect x="34" y="86" width="100" height="3" rx="1" fill="#6b7280" />
      <rect x="0" y="100" width="200" height="40" fill="white" />
      <rect x="12" y="106" width="28" height="24" rx="2" fill="#f1f5f9" />
      <rect x="46" y="106" width="28" height="24" rx="2" fill="#f1f5f9" />
      <rect x="80" y="106" width="28" height="24" rx="2" fill="#f1f5f9" />
    </svg>
  );
}

const THUMBNAILS: Record<TemplateId, React.ComponentType<{ active: boolean }>> = {
  classic: ClassicThumbnail,
  minimal: MinimalThumbnail,
  bold:    BoldThumbnail,
};

// ── Theme preview card ───────────────────────────────────────────────────────

function ThemeCard({
  theme,
  isActive,
  locked,
  saving,
  onClick,
}: {
  theme: { id: string; name: string; description: string; preview: { bg: string; primary: string; accent: string }; swatches?: string[]; emoji?: string; mood?: string };
  isActive:  boolean;
  locked:    boolean;
  saving:    boolean;
  onClick:   () => void;
}) {
  return (
    <div
      onClick={() => !locked && !saving && onClick()}
      className={cn(
        "relative rounded-2xl border-2 overflow-hidden transition-all",
        locked
          ? "border-gray-200 opacity-75 cursor-not-allowed"
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
        {/* Colour swatches strip (genre palettes only) */}
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
        <div className="absolute inset-0 bg-white/50 flex flex-col items-center justify-center gap-1">
          <div className="w-8 h-8 rounded-full bg-gray-800/70 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-white bg-gray-800/70 px-2 py-0.5 rounded-full">
            Premium
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
  currentTemplate,
  currentTheme,
  authorSlug,
  planTier,
}: AppearanceClientProps) {
  const [activeTab,      setActiveTab]      = useState<"themes" | "templates">("themes");
  const [selectedTmpl,   setSelectedTmpl]   = useState(currentTemplate);
  const [appliedTmpl,    setAppliedTmpl]    = useState(currentTemplate);
  const [selectedTheme,  setSelectedTheme]  = useState(currentTheme);
  const [savingTmpl,     setSavingTmpl]     = useState(false);
  const [savingTheme,    setSavingTheme]    = useState<string | null>(null);
  const [tmplSaved,      setTmplSaved]      = useState(false);
  const [error,          setError]          = useState("");

  const isPremium  = planTier === "PREMIUM";
  const isStandard = planTier === "STANDARD" || isPremium;

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const siteUrl        = `https://${authorSlug}.${platformDomain}`;
  const isDirtyTmpl    = selectedTmpl !== appliedTmpl;

  // ── Save template ──────────────────────────────────────────────────────────
  async function handleApplyTemplate() {
    setSavingTmpl(true);
    setError("");
    try {
      const res = await fetch("/api/admin/appearance", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ homeTemplate: selectedTmpl }),
      });
      if (res.ok) {
        setAppliedTmpl(selectedTmpl);
        setTmplSaved(true);
        setTimeout(() => setTmplSaved(false), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save template.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSavingTmpl(false);
    }
  }

  // ── Save theme (instant on click) ──────────────────────────────────────────
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
    <div className="space-y-6">

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["themes", "templates"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === "themes" ? "Themes" : "Layout Templates"}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  THEMES TAB                                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "themes" && (
        <div className="space-y-8">

          {/* Base themes */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">Website Themes</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sets the colour palette and typography across your entire site. Click to apply instantly.
                  {!isStandard && (
                    <span className="ml-1 text-amber-600 font-medium">Upgrade to Standard to unlock themes.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {BASE_THEMES.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={selectedTheme === theme.id}
                  locked={!isStandard && theme.id !== "classic-literary"}
                  saving={savingTheme === theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                />
              ))}
            </div>
          </section>

          {/* Genre palettes */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
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
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GENRE_PALETTES.map((palette) => (
                <ThemeCard
                  key={palette.id}
                  theme={palette}
                  isActive={selectedTheme === palette.id}
                  locked={!isPremium}
                  saving={savingTheme === palette.id}
                  onClick={() => handleSelectTheme(palette.id)}
                />
              ))}
            </div>
          </section>

          {/* View live site */}
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
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/*  TEMPLATES TAB                                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-900">Layout Templates</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Choose how your homepage is structured — hero style, section order, and overall layout.
                Your theme colours and content always carry over.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {TEMPLATES.map((tmpl) => {
                const Thumb    = THUMBNAILS[tmpl.id];
                const isActive = selectedTmpl === tmpl.id;
                const isCurrent = appliedTmpl === tmpl.id;

                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTmpl(tmpl.id)}
                    className={cn(
                      "group rounded-xl border-2 p-0 overflow-hidden text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      isActive
                        ? "border-blue-600 shadow-md shadow-blue-100"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "bg-gray-50 border-b border-gray-100 p-3 transition-colors",
                      isActive && "bg-blue-50 border-blue-100"
                    )}>
                      <Thumb active={isActive} />
                    </div>
                    <div className="px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-sm font-semibold",
                          isActive ? "text-blue-700" : "text-gray-900"
                        )}>
                          {tmpl.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isCurrent && (
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                              Active
                            </span>
                          )}
                          {isActive && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{tmpl.description}</p>
                    </div>
                    <div className="px-4 pb-3">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        {tmpl.heroStyle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Apply button */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleApplyTemplate}
                disabled={savingTmpl || !isDirtyTmpl}
                size="lg"
              >
                {savingTmpl ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Applying…</>
                ) : tmplSaved ? (
                  <><Check className="h-4 w-4 mr-2" />Applied!</>
                ) : (
                  "Apply Template"
                )}
              </Button>
              {!isDirtyTmpl && !tmplSaved && (
                <p className="text-xs text-gray-400">Select a different template to apply.</p>
              )}
              {isDirtyTmpl && !savingTmpl && (
                <p className="text-xs text-gray-500">
                  Switching to <span className="font-medium capitalize">{selectedTmpl}</span>
                </p>
              )}
            </div>
          </section>

          <div className="flex items-center gap-3">
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              View your live site →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
