"use client";

import { useState, useRef } from "react";
import { Check, Loader2, Monitor, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATES, type TemplateId } from "@/lib/templates";
import { cn } from "@/lib/utils";

interface AppearanceClientProps {
  currentTemplate: string;
  authorSlug: string;
}

// SVG thumbnail mockups for each template
function ClassicThumbnail({ active }: { active: boolean }) {
  const accent = active ? "#2563EB" : "#94a3b8";
  return (
    <svg viewBox="0 0 200 140" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      {/* Hero banner */}
      <rect x="0" y="0" width="200" height="52" fill={accent} rx="4" />
      {/* Text lines in hero */}
      <rect x="12" y="12" width="80" height="6" rx="2" fill="white" opacity="0.9" />
      <rect x="12" y="24" width="55" height="4" rx="2" fill="white" opacity="0.5" />
      <rect x="12" y="34" width="40" height="10" rx="3" fill="white" opacity="0.85" />
      {/* Book covers in hero */}
      <rect x="140" y="8" width="24" height="36" rx="2" fill="white" opacity="0.3" />
      <rect x="168" y="14" width="20" height="30" rx="2" fill="white" opacity="0.2" />
      {/* Bio section */}
      <rect x="12" y="60" width="70" height="5" rx="2" fill="#1f2937" />
      <rect x="12" y="70" width="100" height="3" rx="1" fill="#9ca3af" />
      <rect x="12" y="76" width="85" height="3" rx="1" fill="#9ca3af" />
      <rect x="12" y="82" width="95" height="3" rx="1" fill="#9ca3af" />
      {/* Profile circle */}
      <circle cx="168" cy="76" r="20" fill="#e5e7eb" />
      {/* Books list */}
      <rect x="12" y="100" width="176" height="12" rx="2" fill="#f9fafb" />
      <rect x="12" y="116" width="176" height="12" rx="2" fill="#f9fafb" />
    </svg>
  );
}

function MinimalThumbnail({ active }: { active: boolean }) {
  const accent = active ? "#2563EB" : "#94a3b8";
  return (
    <svg viewBox="0 0 200 140" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      {/* White background with subtle border */}
      <rect x="0" y="0" width="200" height="140" fill="white" rx="4" />
      <rect x="0" y="0" width="200" height="140" fill="none" stroke="#e5e7eb" strokeWidth="1" rx="4" />
      {/* Thin accent bar */}
      <rect x="12" y="14" width="16" height="2" rx="1" fill={accent} />
      {/* Profile circle - small */}
      <circle cx="170" cy="36" r="16" fill="#f3f4f6" />
      {/* Author name - serif feel */}
      <rect x="12" y="22" width="90" height="9" rx="2" fill="#111827" />
      <rect x="12" y="36" width="55" height="3" rx="1" fill="#9ca3af" />
      <rect x="12" y="44" width="100" height="3" rx="1" fill="#d1d5db" />
      <rect x="12" y="51" width="88" height="3" rx="1" fill="#d1d5db" />
      {/* CTA buttons */}
      <rect x="12" y="60" width="50" height="10" rx="3" fill={accent} opacity="0.85" />
      <rect x="66" y="60" width="60" height="10" rx="3" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      {/* Books grid */}
      <rect x="12" y="82" width="176" height="4" rx="1" fill="#f9fafb" />
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
      {/* Dark hero */}
      <rect x="0" y="0" width="200" height="80" fill="#0f172a" rx="4" />
      {/* Accent glow */}
      <ellipse cx="150" cy="40" rx="60" ry="40" fill={accent} opacity="0.15" />
      {/* Text */}
      <rect x="12" y="14" width="30" height="3" rx="1" fill={accent} opacity="0.9" />
      <rect x="12" y="22" width="85" height="12" rx="2" fill="white" opacity="0.95" />
      <rect x="12" y="38" width="60" height="4" rx="1" fill="white" opacity="0.4" />
      <rect x="12" y="46" width="45" height="10" rx="3" fill={accent} />
      {/* Large book covers */}
      <rect x="130" y="6" width="32" height="48" rx="3" fill="#1e293b" />
      <rect x="132" y="8" width="28" height="44" rx="2" fill={accent} opacity="0.3" />
      <rect x="166" y="16" width="24" height="36" rx="3" fill="#1e293b" />
      {/* Dark author strip */}
      <rect x="0" y="80" width="200" height="20" fill="#1e293b" />
      <circle cx="20" cy="90" r="7" fill="#374151" />
      <rect x="34" y="86" width="100" height="3" rx="1" fill="#6b7280" />
      <rect x="34" y="92" width="80" height="3" rx="1" fill="#4b5563" />
      {/* Book grid */}
      <rect x="0" y="100" width="200" height="40" fill="white" />
      <rect x="12" y="106" width="28" height="24" rx="2" fill="#f1f5f9" />
      <rect x="46" y="106" width="28" height="24" rx="2" fill="#f1f5f9" />
      <rect x="80" y="106" width="28" height="24" rx="2" fill="#f1f5f9" />
      <rect x="114" y="106" width="28" height="24" rx="2" fill="#f1f5f9" />
      <rect x="148" y="106" width="28" height="24" rx="2" fill="#f1f5f9" />
    </svg>
  );
}

const THUMBNAILS: Record<TemplateId, React.ComponentType<{ active: boolean }>> = {
  classic: ClassicThumbnail,
  minimal: MinimalThumbnail,
  bold: BoldThumbnail,
};

export function AppearanceClient({ currentTemplate, authorSlug }: AppearanceClientProps) {
  const [selected, setSelected] = useState<string>(currentTemplate);
  // Track the last successfully applied template in state so isDirty stays
  // accurate after a save — without this, switching back to the original value
  // after saving a different template would incorrectly disable the Apply button.
  const [appliedTemplate, setAppliedTemplate] = useState<string>(currentTemplate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const siteUrl = `http://${authorSlug}.localhost:3000`;
  const isDirty = selected !== appliedTemplate;

  async function handleApply() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/admin/appearance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeTemplate: selected }),
      });

      if (res.ok) {
        setSaved(true);
        setAppliedTemplate(selected);
        // Reload the preview iframe to reflect the change
        setPreviewKey((k) => k + 1);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Could not save template.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Template Cards ──────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-gray-900">Choose a Template</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Select a layout for your homepage. The template affects the hero style, typography, and section order.
            Your accent colour, books, and bio always carry over.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {TEMPLATES.map((tmpl) => {
            const Thumb = THUMBNAILS[tmpl.id];
            const isActive = selected === tmpl.id;
            const isCurrent = appliedTemplate === tmpl.id;

            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setSelected(tmpl.id)}
                className={cn(
                  "group rounded-xl border-2 p-0 overflow-hidden text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isActive
                    ? "border-blue-600 shadow-md shadow-blue-100"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
              >
                {/* Thumbnail */}
                <div className={cn(
                  "bg-gray-50 border-b border-gray-100 p-3 transition-colors",
                  isActive && "bg-blue-50 border-blue-100"
                )}>
                  <Thumb active={isActive} />
                </div>

                {/* Label */}
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

                {/* Feature badges */}
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {tmpl.heroStyle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Save / status row */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        )}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleApply}
            disabled={saving || !isDirty}
            size="lg"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Applying…</>
            ) : saved ? (
              <><Check className="h-4 w-4 mr-2" />Applied!</>
            ) : (
              "Apply Template"
            )}
          </Button>
          {!isDirty && !saved && (
            <p className="text-xs text-gray-400">Select a different template to apply.</p>
          )}
          {isDirty && !saving && (
            <p className="text-xs text-gray-500">
              Switching from <span className="font-medium capitalize">{appliedTemplate}</span> to{" "}
              <span className="font-medium capitalize">{selected}</span>
            </p>
          )}
        </div>
      </section>

      {/* ── Live Preview ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Live Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewKey((k) => k + 1)}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded"
              title="Reload preview"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50"
            >
              Open live site <ExternalLink className="h-3 w-3" />
            </a>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewing((v) => !v)}
            >
              {previewing ? "Hide Preview" : "Show Preview"}
            </Button>
          </div>
        </div>

        {previewing ? (
          <div className="relative">
            {/* Browser chrome simulation */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-500 font-mono border border-gray-200 truncate">
                {siteUrl}
              </div>
            </div>
            <iframe
              key={previewKey}
              ref={iframeRef}
              src={siteUrl}
              className="w-full border-0"
              style={{ height: "600px" }}
              title="Live site preview"
            />
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Monitor className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">Click <strong>Show Preview</strong> to load your live site in an iframe.</p>
            <p className="text-xs text-gray-400">
              Apply a template first, then reload the preview to see it live.
            </p>
          </div>
        )}
      </section>

      {/* ── Template Details ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Template Details</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {TEMPLATES.map((tmpl) => {
            const isSelected = selected === tmpl.id;
            return (
              <div
                key={tmpl.id}
                className={cn(
                  "rounded-lg border p-4 space-y-3 transition-colors",
                  isSelected ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50"
                )}
              >
                <p className={cn(
                  "font-semibold text-sm",
                  isSelected ? "text-blue-800" : "text-gray-700"
                )}>
                  {tmpl.name}
                </p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0 w-16">Hero</span>
                    <span>{tmpl.heroStyle}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0 w-16">Type</span>
                    <span>{tmpl.typographyNote}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0 w-16">Colour</span>
                    <span>{tmpl.colorNote}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0 w-16">Layout</span>
                    <span>{tmpl.layoutNote}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
