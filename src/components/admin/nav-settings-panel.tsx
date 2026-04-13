"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSettings {
  navShowAbout: boolean;
  navShowBooks: boolean;
  navShowSpecials: boolean;
  navShowFlipBooks: boolean;
  navShowBlog: boolean;
  navShowContact: boolean;
}

interface NavSettingsPanelProps {
  initial: NavSettings;
  flipBooksEnabled: boolean;
}

const BUILT_IN_ITEMS = [
  {
    key: "navShowAbout" as keyof NavSettings,
    label: "About",
    href: "/about",
    description: "Your author bio page",
    alwaysOn: false,
  },
  {
    key: "navShowBooks" as keyof NavSettings,
    label: "Books",
    href: "/books",
    description: "Your book catalogue",
    alwaysOn: false,
  },
  {
    key: "navShowSpecials" as keyof NavSettings,
    label: "Specials",
    href: "/specials",
    description: "Promotions and special offers",
    alwaysOn: false,
  },
  {
    key: "navShowFlipBooks" as keyof NavSettings,
    label: "Flip Books",
    href: "/flip-books",
    description: "Interactive flip book reader",
    alwaysOn: false,
    planGated: true,
  },
  {
    key: "navShowBlog" as keyof NavSettings,
    label: "Blog / News",
    href: "/blog",
    description: "Posts, announcements, and updates",
    alwaysOn: false,
  },
  {
    key: "navShowContact" as keyof NavSettings,
    label: "Contact",
    href: "/contact",
    description: "Contact form for readers",
    alwaysOn: false,
  },
];

export function NavSettingsPanel({ initial, flipBooksEnabled }: NavSettingsPanelProps) {
  const [settings, setSettings] = useState<NavSettings>(initial);
  const [saving, setSaving] = useState<keyof NavSettings | null>(null);
  const [saved, setSaved] = useState<keyof NavSettings | null>(null);

  async function toggle(key: keyof NavSettings) {
    const newValue = !settings[key];
    setSaving(key);
    try {
      const res = await fetch("/api/admin/nav-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newValue }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSettings((prev) => ({ ...prev, [key]: newValue }));
      setSaved(key);
      setTimeout(() => setSaved(null), 1500);
    } catch {
      // revert on error
    } finally {
      setSaving(null);
    }
  }

  const items = BUILT_IN_ITEMS.filter(
    (item) => !item.planGated || flipBooksEnabled
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Always-visible Home row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          <div>
            <span className="text-sm font-medium text-gray-700">Home</span>
            <span className="ml-2 text-xs text-gray-400">/</span>
          </div>
          <span className="text-xs text-gray-400">Your site homepage — always visible</span>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Always on</span>
      </div>

      {items.map((item, i) => {
        const isOn = settings[item.key];
        const isSaving = saving === item.key;
        const isSaved = saved === item.key;

        return (
          <div
            key={item.key}
            className={cn(
              "flex items-center justify-between px-4 py-3",
              i < items.length - 1 && "border-b border-gray-100"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0 transition-colors",
                  isOn ? "bg-green-400" : "bg-gray-300"
                )}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="ml-2 text-xs text-gray-400">{item.href}</span>
              </div>
              <span className="text-xs text-gray-400 hidden sm:inline">{item.description}</span>
            </div>

            <div className="flex items-center gap-3">
              {isSaved && (
                <span className="text-xs text-green-600 font-medium">Saved</span>
              )}
              <button
                onClick={() => toggle(item.key)}
                disabled={!!saving}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60",
                  isOn ? "bg-blue-600" : "bg-gray-300"
                )}
                aria-label={isOn ? `Hide ${item.label}` : `Show ${item.label}`}
              >
                {isSaving ? (
                  <Loader2 className="absolute left-1/2 -translate-x-1/2 h-3.5 w-3.5 text-white animate-spin" />
                ) : (
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
                      isOn ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                )}
              </button>
              {isOn ? (
                <Eye className="h-4 w-4 text-blue-500 flex-shrink-0" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
