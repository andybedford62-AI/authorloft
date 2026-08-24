"use client";

import { useState } from "react";
import { Youtube, ClipboardPaste } from "lucide-react";
import { YouTubeMusicImportPanel } from "@/components/admin/youtube-music-import-panel";
import { MusicPastePanel } from "@/components/admin/music-paste-panel";

// Two ways to bulk-add tracks, tabbed so the page shows one at a time. The
// author's own lists stay visible below rather than being hidden behind a tab —
// tabbing the input methods declutters without burying their content.
// Tab styling matches branding-form.tsx.

const TABS = [
  { id: "youtube" as const, label: "YouTube playlist", icon: Youtube },
  { id: "paste" as const, label: "Paste links", icon: ClipboardPaste },
];

export function MusicAddTabs({
  atListLimit,
  trackCap,
}: {
  atListLimit: boolean;
  trackCap: number | null;
}) {
  const [active, setActive] = useState<"youtube" | "paste">("youtube");

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex border-b border-gray-200 px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                active === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-6">
        {active === "youtube" ? (
          <YouTubeMusicImportPanel atListLimit={atListLimit} />
        ) : (
          <MusicPastePanel atListLimit={atListLimit} trackCap={trackCap} />
        )}
      </div>
    </div>
  );
}
