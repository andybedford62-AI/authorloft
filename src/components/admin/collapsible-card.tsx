"use client";

import { ChevronDown, ChevronRight } from "lucide-react";

// A collapsible card for one part of a long admin editor (book, course), like
// the music track rows: the header always shows, with a one-line summary while
// it's closed, so a long form reads as a short list of what's in it.

export function CollapsibleCard({
  title,
  icon,
  summary,
  open,
  onToggle,
  actions,
  className = "bg-white border-gray-200",
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  summary?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  /** Extra controls on the right of the header, shown while open. */
  actions?: React.ReactNode;
  /** Background + border colours; defaults to a plain white card. */
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border ${className}`}>
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex flex-1 min-w-0 items-center gap-2 text-left"
        >
          {open
            ? <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
            : <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          {icon}
          <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{title}</span>
          {!open && summary && <span className="text-xs text-gray-500 truncate">{summary}</span>}
        </button>
        {open && actions}
      </div>
      {open && <div className="px-4 sm:px-5 pb-5 pt-4 space-y-5 border-t border-black/5">{children}</div>}
    </section>
  );
}
