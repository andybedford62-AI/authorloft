"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, X, ArrowRight } from "lucide-react";

const DISMISS_KEY = "social-promote-nudge-dismissed";

export function SocialPromoteNudge({
  show,
}: {
  show: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    if (!dismissed) setVisible(true);
  }, [show]);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4 flex items-start gap-4">
      <div className="flex-shrink-0 p-2 rounded-lg bg-white border border-violet-100">
        <Megaphone className="h-5 w-5 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-violet-900 text-sm">
          New: let AI draft your next social post
        </p>
        <p className="text-xs text-violet-700 mt-1 leading-relaxed">
          Pick a book, a platform, and an angle — Promote generates a ready-to-copy post in
          seconds, using your book details and your own voice. No scheduling, no OAuth, just
          copy and paste.
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Link
            href="/admin/promote"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Try Promote <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 text-violet-400 hover:text-violet-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
