"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS: [string, string][] = [
  ["/blog", "Blog"],
  ["/news", "News"],
  ["/resources", "Tools & Communities"],
];

/** Light-theme "Resources ▾" dropdown for the secondary marketing nav. */
export function MarketingNavDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        Resources
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-lg py-1.5">
            {ITEMS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
