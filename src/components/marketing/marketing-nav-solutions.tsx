"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SOLUTION_CATEGORIES } from "@/lib/solution-categories";

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
        className="flex items-center gap-1 text-sm text-vault-mute hover:text-vault-ink transition-colors"
      >
        Solutions
        <ChevronDown className={`h-3.5 w-3.5 text-vault-mute transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
          <div className="w-[380px] bg-vault-surf border border-vault-ink/12 rounded-xl shadow-lg p-3">
            <Link
              href="/features"
              className="flex items-center justify-between gap-3 bg-vault-gold/8 rounded-lg px-3 py-2.5 mb-2 hover:bg-vault-gold/14 transition-colors"
            >
              <span className="text-[13.5px] font-semibold text-vault-gold">Compare every feature</span>
              <ChevronRight className="h-3.5 w-3.5 text-vault-gold flex-shrink-0" />
            </Link>

            <Link
              href="/compare"
              className="flex items-center justify-between gap-3 bg-vault-gold/8 rounded-lg px-3 py-2.5 mb-2 hover:bg-vault-gold/14 transition-colors"
            >
              <span className="text-[13.5px] font-semibold text-vault-gold">Compare vs. the competition</span>
              <ChevronRight className="h-3.5 w-3.5 text-vault-gold flex-shrink-0" />
            </Link>

            <div className="border-t border-vault-ink/8 my-1.5" />

            {SOLUTION_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/solutions#${cat.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-vault-ink/6 transition-colors group"
              >
                <span>
                  <span className="block text-sm font-semibold text-vault-ink group-hover:text-vault-gold transition-colors">
                    {cat.label}
                  </span>
                  <span className="block text-xs text-vault-mute mt-0.5">{cat.description}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-vault-mute flex-shrink-0" />
              </Link>
            ))}

            <div className="border-t border-vault-ink/8 mt-1.5 pt-2">
              <Link href="/solutions" className="text-xs font-medium text-vault-mute hover:text-vault-gold transition-colors">
                Browse all 12 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
