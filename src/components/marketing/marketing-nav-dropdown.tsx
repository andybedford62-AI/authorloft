"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const ITEMS: [string, string][] = [
  ["/guides", "Learn"],
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
        className="flex items-center gap-1 text-sm text-[#93a0bc] hover:text-[#f3ecdb] transition-colors"
      >
        Resources
        <ChevronDown className={`h-3.5 w-3.5 text-[#93a0bc] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="min-w-[200px] bg-[#1e2f4d] border border-[rgba(243,236,219,0.12)] rounded-xl shadow-lg py-1.5">
            {ITEMS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="block px-4 py-2 text-sm text-[#93a0bc] hover:text-[#f3ecdb] hover:bg-[rgba(243,236,219,0.06)] transition-colors"
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
