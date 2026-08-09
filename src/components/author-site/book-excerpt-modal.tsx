"use client";

import { useState, useEffect, useRef } from "react";
import { X, BookOpen } from "lucide-react";

interface Props {
  sampleContent: string;
  bookTitle: string;
  bookSlug: string;
  hasBuyOptions: boolean;
  accentColor: string;
}

export function BookExcerptModal({ sampleContent, bookTitle, bookSlug, hasBuyOptions, accentColor }: Props) {
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Trigger — teaser snippet + button */}
      <div className="pt-2 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Read an Excerpt</h2>

        {/* Short teaser — first ~200 chars, no HTML */}
        <p className="text-base text-gray-600 leading-relaxed line-clamp-3 italic">
          {sampleContent.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220)}
          {sampleContent.replace(/<[^>]+>/g, "").length > 220 ? "…" : ""}
        </p>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 hover:opacity-80"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          <BookOpen className="h-4 w-4" />
          Read the full excerpt
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Excerpt from ${bookTitle}`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[88vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Excerpt</p>
                <h2 className="text-base font-bold text-gray-900 leading-tight">{bookTitle}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close excerpt"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-6 sm:px-8 py-6"
            >
              <div
                className="prose prose-base max-w-none text-gray-800 leading-[1.8] rich-content"
                dangerouslySetInnerHTML={{ __html: sampleContent }}
              />
            </div>

            {/* Sticky footer CTA */}
            {hasBuyOptions && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">Enjoyed the excerpt?</p>
                <a
                  href={`/books/${bookSlug}#buy`}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: accentColor }}
                >
                  Get this book →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
