"use client";

import { useState } from "react";
import { Check, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Layout = "list" | "grid" | "shelf";

interface LayoutOption {
  id:          Layout;
  label:       string;
  description: string;
  premium:     boolean;
  illustration: React.ReactNode;
}

// ── CSS illustrations ─────────────────────────────────────────────────────────

function ListIllustration() {
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-7 h-10 rounded bg-blue-200 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-2 bg-gray-300 rounded w-3/4" />
            <div className="h-1.5 bg-gray-200 rounded w-full" />
            <div className="h-1.5 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GridIllustration() {
  const covers = [
    "bg-blue-200", "bg-purple-200", "bg-green-200", "bg-amber-200",
    "bg-rose-200", "bg-indigo-200",
  ];
  return (
    <div className="w-full h-full flex flex-col justify-center px-3 py-2">
      <div className="grid grid-cols-3 gap-1.5">
        {covers.map((c, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <div className={cn("rounded aspect-[2/3] w-full", c)} />
            <div className="h-1.5 bg-gray-300 rounded w-3/4 mx-auto" />
            <div className="h-1 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ShelfIllustration() {
  const row1 = ["bg-blue-200", "bg-purple-200", "bg-green-200", "bg-amber-200", "bg-rose-200"];
  const row2 = ["bg-indigo-200", "bg-teal-200", "bg-orange-200", "bg-pink-200", "bg-lime-200"];
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2 px-2 py-2">
      {[row1, row2].map((row, ri) => (
        <div key={ri}>
          <div className="flex items-end gap-0.5 justify-center">
            {row.map((c, i) => (
              <div key={i} className={cn("rounded-t", c)} style={{ width: 18, height: i % 2 === 0 ? 36 : 42 }} />
            ))}
          </div>
          {/* Wood shelf bar */}
          <div
            className="w-full rounded-sm mt-0.5"
            style={{
              height: 5,
              background: "linear-gradient(180deg, #c8965a 0%, #a0693a 100%)",
              boxShadow: "0 2px 3px rgba(0,0,0,0.25)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Layout options ────────────────────────────────────────────────────────────

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id:          "list",
    label:       "List",
    description: "Cover + title and description side by side. Best for showcasing book details.",
    premium:     false,
    illustration: <ListIllustration />,
  },
  {
    id:          "grid",
    label:       "Grid",
    description: "Cover-forward grid, 3 per row. Clean and visual — great for large catalogs.",
    premium:     true,
    illustration: <GridIllustration />,
  },
  {
    id:          "shelf",
    label:       "Shelf",
    description: "Books displayed upright on wood shelves, just like a real bookcase.",
    premium:     true,
    illustration: <ShelfIllustration />,
  },
];

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  currentLayout: string;
  planTier:      string;
}

export function BookShelfPicker({ currentLayout, planTier }: Props) {
  const [selected, setSelected] = useState<Layout>(currentLayout as Layout);
  const [saving, setSaving]     = useState<Layout | null>(null);
  const [error, setError]       = useState("");

  const isLocked = (opt: LayoutOption) =>
    opt.premium && planTier === "FREE";

  async function handleSelect(layout: Layout) {
    if (saving) return;
    if (layout === selected) return;
    const opt = LAYOUT_OPTIONS.find((o) => o.id === layout)!;
    if (isLocked(opt)) return;

    setSaving(layout);
    setError("");
    try {
      const res = await fetch("/api/admin/appearance", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ booksLayout: layout }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelected(layout);
      } else {
        setError(data.error ?? "Could not save layout.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Public Books Page Layout</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose how your books are displayed to visitors. Changes take effect immediately.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-5">
        {LAYOUT_OPTIONS.map((opt) => {
          const locked  = isLocked(opt);
          const active  = selected === opt.id;
          const loading = saving === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={locked || !!saving}
              className={cn(
                "relative flex flex-col rounded-xl border-2 overflow-hidden text-left transition-all duration-200 group",
                active
                  ? "border-blue-600 shadow-md"
                  : locked
                  ? "border-gray-200 opacity-70 cursor-not-allowed"
                  : "border-gray-200 hover:border-blue-400 hover:shadow-sm cursor-pointer"
              )}
            >
              {/* Illustration area */}
              <div className="h-44 bg-gray-50 relative">
                {opt.illustration}

                {/* Active check */}
                {active && !loading && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}

                {/* Saving spinner */}
                {loading && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                  </div>
                )}

                {/* Lock overlay */}
                {locked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px]">
                    <Lock className="h-5 w-5 text-gray-400 mb-1" />
                    <span className="text-xs font-semibold text-gray-500">Standard / Premium</span>
                  </div>
                )}
              </div>

              {/* Label + description */}
              <div className="px-4 py-3 bg-white flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className={cn(
                    "font-semibold text-sm",
                    active ? "text-blue-700" : "text-gray-900"
                  )}>
                    {opt.label}
                  </p>
                  {!opt.premium && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                      All plans
                    </span>
                  )}
                  {opt.premium && !locked && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">
                      Standard+
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">
        Grid and Shelf layouts are available on Standard and Premium plans.{" "}
        {planTier === "FREE" && (
          <a href="/admin/settings" className="text-blue-600 hover:underline">Upgrade your plan</a>
        )}
      </p>
    </div>
  );
}
