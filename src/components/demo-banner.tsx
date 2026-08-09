"use client";

import { useState, useEffect } from "react";
import { isDemoMode } from "@/lib/demo-mode";
import { X } from "lucide-react";

export function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoMode());
  }, []);

  if (!isDemo || isDismissed) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="bg-blue-100 text-blue-900 font-bold px-3 py-1 rounded text-sm whitespace-nowrap">
          70% Demo
        </div>
        <p className="text-sm text-gray-700">
          You're viewing a demonstration. Ready to own your author business?{" "}
          <a
            href="https://www.authorloft.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold underline"
          >
            View pricing
          </a>
        </p>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="text-gray-500 hover:text-gray-700 flex-shrink-0"
        aria-label="Dismiss demo banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
