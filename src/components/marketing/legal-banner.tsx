"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Shield } from "lucide-react";

interface LegalBannerProps {
  privacyUpdatedAt: string | null; // ISO string or null
  termsUpdatedAt: string | null;   // ISO string or null
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function needsAck(updatedAt: string | null, cookieName: string): boolean {
  if (!updatedAt) return false;
  const ack = getCookie(cookieName);
  if (!ack) return true;
  return new Date(ack) < new Date(updatedAt);
}

export function LegalBanner({ privacyUpdatedAt, termsUpdatedAt }: LegalBannerProps) {
  const [show,           setShow]           = useState(false);
  const [needsPrivacy,   setNeedsPrivacy]   = useState(false);
  const [needsTerms,     setNeedsTerms]     = useState(false);
  const [acknowledging,  setAcknowledging]  = useState(false);

  useEffect(() => {
    const p = needsAck(privacyUpdatedAt, "bs_privacy_ack");
    const t = needsAck(termsUpdatedAt,   "bs_terms_ack");
    setNeedsPrivacy(p);
    setNeedsTerms(t);
    setShow(p || t);
  }, [privacyUpdatedAt, termsUpdatedAt]);

  if (!show) return null;

  async function handleAccept() {
    setAcknowledging(true);
    const now = new Date().toISOString();
    try {
      await fetch("/api/legal-ack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "all", timestamp: now }),
      });
    } catch {
      // swallow — banner will re-appear on next load if API failed
    }
    setShow(false);
    setAcknowledging(false);
  }

  // Build the updated-documents description
  const updated: string[] = [];
  if (needsPrivacy) updated.push("Privacy Policy");
  if (needsTerms)   updated.push("Terms of Service");
  const label = updated.join(" and ");

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 px-4 pb-4 sm:px-6" role="dialog" aria-live="polite">
      <div className="max-w-3xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">

        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <span className="font-semibold text-white">We've updated our {label}.</span>{" "}
            Please review the changes.{" "}
            {needsPrivacy && (
              <Link href="/privacy" className="underline text-blue-300 hover:text-blue-200">Privacy Policy</Link>
            )}
            {needsPrivacy && needsTerms && " · "}
            {needsTerms && (
              <Link href="/terms" className="underline text-blue-300 hover:text-blue-200">Terms of Service</Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleAccept}
            disabled={acknowledging}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {acknowledging ? "Saving…" : "I understand"}
          </button>
          <button
            onClick={() => setShow(false)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
