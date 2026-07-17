"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { initPostHogIfConsented, optOutPostHog } from "@/lib/posthog-client";

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem("analytics-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem("analytics-consent", accepted ? "accepted" : "declined");
    localStorage.setItem("analytics-consent-date", new Date().toISOString());
    setShowBanner(false);

    if (accepted) {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        (window.dataLayer as unknown[]).push(arguments);
      }
      gtag("consent", "update", {
        analytics_storage: "granted",
      });
      initPostHogIfConsented();
    } else {
      optOutPostHog();
    }
  };

  if (!mounted || !showBanner) return null;

  // Bottom-right floating card, not a full-width bar — the marketing layout's
  // LegalBanner is already a full-width bottom bar, and both being fixed to
  // the same edge made this banner invisible underneath it. Corner placement
  // means the two can never collide regardless of which one mounts first.
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-40 sm:max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-gray-700">
            We use analytics to measure site performance and understand how visitors use AuthorLoft. No personal data is shared without your consent.
          </p>
          <button
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-gray-600 p-1 -m-1 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => handleConsent(false)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleConsent(true)}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
