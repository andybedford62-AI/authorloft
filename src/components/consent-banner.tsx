"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

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
    }
  };

  if (!mounted || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-700 flex-1">
          We use Google Analytics to measure campaign performance and improve your experience. No personal data is shared without your consent.
        </p>
        <div className="flex items-center gap-3">
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
          <button
            onClick={() => setShowBanner(false)}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
