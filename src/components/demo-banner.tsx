"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-800 whitespace-nowrap">
            70% Demo
          </span>
          <p className="text-sm text-blue-900">
            You're viewing a limited demo. <span className="font-medium">Some features are disabled.</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/#pricing"
            className="text-sm font-medium text-blue-700 hover:text-blue-900 underline"
          >
            View Pricing
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded transition-colors"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
