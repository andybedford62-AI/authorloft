"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const GROUPS: { label: string; items: [string, string][] }[] = [
  {
    label: "Your Platform",
    items: [
      ["/author-website-builder", "Author Website Builder"],
      ["/indie-author-bookstore", "Indie Author Bookstore"],
    ],
  },
  {
    label: "Sell & Grow",
    items: [
      ["/sell-books-directly", "Sell Books Directly"],
      ["/book-pre-orders", "Book Pre-Orders"],
      ["/author-affiliate-program", "Affiliate Program"],
    ],
  },
  {
    label: "Marketing & Tools",
    items: [
      ["/book-marketing-platform", "Book Marketing"],
      ["/author-newsletter-platform", "Newsletter Platform"],
      ["/ai-tools-for-authors", "AI Tools for Authors"],
      ["/author-media-kit", "Author Media Kit"],
    ],
  },
  {
    label: "Readers & Analytics",
    items: [
      ["/arc-management", "ARC Management"],
      ["/reader-analytics-for-authors", "Reader Analytics"],
    ],
  },
];

export function MarketingNavSolutions() {
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
        Solutions
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
          <div className="min-w-[460px] bg-white border border-gray-100 rounded-xl shadow-lg p-4 grid grid-cols-2 gap-4">
            {GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1.5 px-2">
                  {group.label}
                </p>
                {group.items.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const SOLUTION_ITEMS: [string, string][] = GROUPS.flatMap((g) => g.items);
