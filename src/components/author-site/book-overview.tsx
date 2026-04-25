"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { sanitize } from "@/lib/sanitize";

interface BookOverviewProps {
  text: string;
  accentColor: string;
}

export function BookOverview({ text, accentColor }: BookOverviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-12 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Book Overview</h2>

      <div
        className={`rich-content text-gray-600 overflow-hidden transition-all duration-300 ${
          expanded ? "" : "line-clamp-2"
        }`}
        dangerouslySetInnerHTML={{ __html: sanitize(text) }}
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: accentColor }}
      >
        {expanded ? (
          <>Less <ChevronUp className="h-3.5 w-3.5" /></>
        ) : (
          <>More <ChevronDown className="h-3.5 w-3.5" /></>
        )}
      </button>
    </div>
  );
}
