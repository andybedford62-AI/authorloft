"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banknote, X, ArrowRight, HelpCircle } from "lucide-react";

const DISMISS_KEY = "stripe-connect-nudge-dismissed";

export function StripeConnectNudge({
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
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start gap-4">
      <div className="flex-shrink-0 p-2 rounded-lg bg-white border border-blue-100">
        <Banknote className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-blue-900 text-sm">
          One more step — connect Stripe to start receiving payments
        </p>
        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
          You&apos;ve enabled direct sales on a book, but readers can&apos;t pay you until Stripe is
          connected to your account. It takes about 5–10 minutes and Stripe walks you through it.
          New to Stripe?{" "}
          <Link href="/admin/help?article=ha_stripe_what" className="underline font-medium">
            Read the beginner&apos;s guide
          </Link>
          .
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Set up Stripe <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            href="/admin/help?article=ha_stripe_info"
            className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:underline font-medium"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            What Stripe will ask for
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
