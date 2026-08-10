"use client";

import { useState } from "react";
import { UserRound, Newspaper } from "lucide-react";

interface AboutMediaKitTabsProps {
  about: React.ReactNode;
  mediaKit: React.ReactNode | null;
  showMediaKitTab: boolean;
  accentColor: string;
  initialTab?: "about" | "media-kit";
}

// About and Media Kit share one tab switcher (mirrors the same pattern
// already used for Books/Bundles) so the site nav only needs one entry
// instead of two. Media Kit tab only renders when the plan enables it AND
// the owner has it toggled on in nav settings; otherwise this just renders
// About plainly, identical to before.
export function AboutMediaKitTabs({
  about, mediaKit, showMediaKitTab, accentColor, initialTab = "about",
}: AboutMediaKitTabsProps) {
  const [active, setActive] = useState<"about" | "media-kit">(initialTab);

  if (!showMediaKitTab) {
    return <>{about}</>;
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActive("about")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors"
          style={
            active === "about"
              ? { backgroundColor: accentColor, borderColor: accentColor, color: "#fff" }
              : { borderColor: "#e5e7eb", color: "#6b7280" }
          }
        >
          <UserRound className="h-4 w-4" /> About
        </button>
        <button
          type="button"
          onClick={() => setActive("media-kit")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors"
          style={
            active === "media-kit"
              ? { backgroundColor: accentColor, borderColor: accentColor, color: "#fff" }
              : { borderColor: "#e5e7eb", color: "#6b7280" }
          }
        >
          <Newspaper className="h-4 w-4" /> Media Kit
        </button>
      </div>

      {active === "about" ? about : mediaKit}
    </div>
  );
}
