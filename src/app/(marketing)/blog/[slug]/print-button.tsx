"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DCDBD3] text-sm text-[#5C6E89] hover:bg-[#E8E5DD] transition-colors"
    >
      <Printer className="h-4 w-4" />
      Print Article
    </button>
  );
}
