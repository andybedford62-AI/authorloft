"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { sanitize } from "@/lib/sanitize";

// The book description in the page's "About this book" section (which supplies
// the heading). Shows the first few lines with "Read more" — the toggle only
// appears when the text is actually cut off.

interface BookOverviewProps {
  text: string;
  accentColor: string;
}

export function BookOverview({ text, accentColor }: BookOverviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [clipped, setClipped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setClipped(el.scrollHeight > el.clientHeight + 2);
  }, [text]);

  return (
    <div>
      <div
        ref={ref}
        className={`rich-content text-gray-700 leading-relaxed overflow-hidden ${expanded ? "" : "line-clamp-6"}`}
        dangerouslySetInnerHTML={{ __html: sanitize(text) }}
      />

      {(clipped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ color: accentColor }}
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
          ) : (
            <>Read more <ChevronDown className="h-3.5 w-3.5" /></>
          )}
        </button>
      )}
    </div>
  );
}
