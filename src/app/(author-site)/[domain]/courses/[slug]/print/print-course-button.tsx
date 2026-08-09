"use client";

import { Printer } from "lucide-react";

export function PrintCourseButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
    >
      <Printer className="h-4 w-4" />
      Print / Save as PDF
    </button>
  );
}
