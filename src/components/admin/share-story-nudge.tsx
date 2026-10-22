"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareQuote, X, ArrowRight } from "lucide-react";

const DISMISS_KEY = "share-story-nudge-dismissed";

/** Asks authors for a testimonial. Sits under the dashboard header; dismissible (localStorage). */
export function ShareStoryNudge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode: just hide it for this view */
    }
    setVisible(false);
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
      <div className="flex-shrink-0 p-2 rounded-lg bg-white border border-amber-100">
        <MessageSquareQuote className="h-5 w-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-900 text-sm">Enjoying AuthorLoft? Share your story</p>
        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
          A few sentences about what you&apos;ve done with it, and an optional star rating, helps other authors decide.
        </p>
        <Link
          href="/share-your-story"
          target="_blank"
          className="mt-3 inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Leave a testimonial <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 p-1 text-amber-400 hover:text-amber-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
