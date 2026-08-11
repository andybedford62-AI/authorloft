"use client";

import { useState } from "react";

interface ScopeOption {
  id: string;
  title: string;
}

type ScopeType = "books" | "bundles" | "courses";

interface DiscountScopePickerProps {
  books: ScopeOption[];
  bundles: ScopeOption[];
  courses: ScopeOption[];
  bookIds: string[];
  bundleIds: string[];
  courseIds: string[];
  onChange: (next: { bookIds: string[]; bundleIds: string[]; courseIds: string[] }) => void;
}

export function DiscountScopePicker({
  books, bundles, courses, bookIds, bundleIds, courseIds, onChange,
}: DiscountScopePickerProps) {
  // Local UI mode — deliberately NOT derived from id counts. If it were derived,
  // clicking "Restrict to specific items" with nothing checked yet would do
  // nothing visible, since no ids would have changed.
  const [mode, setMode] = useState<"all" | "restrict">(
    bookIds.length + bundleIds.length + courseIds.length > 0 ? "restrict" : "all"
  );

  const scopeGroups: { type: ScopeType; label: string; options: ScopeOption[]; ids: string[] }[] = [
    { type: "books",   label: "Books",   options: books,   ids: bookIds },
    { type: "bundles", label: "Bundles", options: bundles, ids: bundleIds },
    { type: "courses", label: "Courses", options: courses, ids: courseIds },
  ];
  const availableTypes = scopeGroups.filter((t) => t.options.length > 0);

  const [activeTab, setActiveTab] = useState<ScopeType | null>(availableTypes[0]?.type ?? null);
  const currentTab = availableTypes.find((t) => t.type === activeTab) ?? availableTypes[0];

  function setEverything() {
    setMode("all");
    onChange({ bookIds: [], bundleIds: [], courseIds: [] });
  }

  function setRestricted() {
    setMode("restrict");
  }

  function toggleId(type: ScopeType, id: string, checked: boolean) {
    const current = { bookIds, bundleIds, courseIds };
    const key = type === "books" ? "bookIds" : type === "bundles" ? "bundleIds" : "courseIds";
    const next = checked
      ? [...current[key], id]
      : current[key].filter((x) => x !== id);
    onChange({ ...current, [key]: next });
  }

  if (availableTypes.length === 0) {
    return (
      <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        This code will apply to everything you sell. (You don&apos;t have any published books, bundles,
        or courses to restrict it to yet.)
      </p>
    );
  }

  const totalSelected = bookIds.length + bundleIds.length + courseIds.length;

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={setEverything}
          className={`text-left rounded-lg border-2 p-3 transition-colors ${
            mode === "all" ? "border-[var(--accent)] bg-[color:var(--accent)]/5" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <p className="text-sm font-semibold text-gray-900">Applies to everything</p>
          <p className="text-xs text-gray-500 mt-0.5">Works on any book, bundle, or course you sell.</p>
        </button>
        <button
          type="button"
          onClick={setRestricted}
          className={`text-left rounded-lg border-2 p-3 transition-colors ${
            mode === "restrict" ? "border-[var(--accent)] bg-[color:var(--accent)]/5" : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <p className="text-sm font-semibold text-gray-900">Restrict to specific items</p>
          <p className="text-xs text-gray-500 mt-0.5">Choose exactly which books, bundles, or courses qualify.</p>
        </button>
      </div>

      {mode === "restrict" && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {availableTypes.length > 1 && (
            <div className="flex border-b border-gray-200 bg-gray-50">
              {availableTypes.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setActiveTab(t.type)}
                  className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                    currentTab?.type === t.type
                      ? "bg-white text-gray-900 border-b-2 border-[var(--accent)]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.label} {t.ids.length > 0 && `(${t.ids.length})`}
                </button>
              ))}
            </div>
          )}
          {currentTab && (
            <div className="max-h-48 overflow-y-auto p-2 space-y-0.5">
              {currentTab.options.map((o) => (
                <label
                  key={o.id}
                  className="flex items-center gap-2.5 text-sm cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={currentTab.ids.includes(o.id)}
                    onChange={(e) => toggleId(currentTab.type, o.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{o.title}</span>
                </label>
              ))}
            </div>
          )}
          {totalSelected === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 border-t border-gray-200">
              0 selected — this currently applies to everything until you check at least one item.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
