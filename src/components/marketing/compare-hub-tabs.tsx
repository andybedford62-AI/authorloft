"use client";

import { useState } from "react";
import { Check, X, Minus } from "lucide-react";
import { COMPARE_CATEGORIES, type Cell } from "@/lib/compare-hub-data";

function CellIcon({ v }: { v: Cell }) {
  if (v === "yes") return <Check className="h-5 w-5 text-emerald-500 mx-auto" aria-label="Yes" />;
  if (v === "limited") return <Minus className="h-5 w-5 text-amber-400 mx-auto" aria-label="Limited" />;
  return <X className="h-5 w-5 text-[#93a0bc] mx-auto" aria-label="No" />;
}

export function CompareHubTabs() {
  const [activeId, setActiveId] = useState<(typeof COMPARE_CATEGORIES)[number]["id"]>("books");
  const active = COMPARE_CATEGORIES.find((c) => c.id === activeId) ?? COMPARE_CATEGORIES[0];

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-2 mb-8 border-b border-[#2a3a5c]">
        {COMPARE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveId(cat.id)}
            className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeId === cat.id
                ? "border-[#d6a94a] text-[#d6a94a]"
                : "border-transparent text-[#93a0bc] hover:text-[#f3ecdb]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <p className="text-[#c4cbdc] text-base leading-relaxed mb-8 max-w-2xl">{active.intro}</p>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-xl border border-[#2a3a5c]">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="bg-[#1c2b4a]">
              <th className="text-left px-4 py-3 text-[#f3ecdb] font-semibold">Feature</th>
              <th className="px-4 py-3 text-[#d6a94a] font-semibold whitespace-nowrap">AuthorLoft</th>
              {active.competitorNames.map((name) => (
                <th key={name} className="px-4 py-3 text-[#93a0bc] font-medium whitespace-nowrap">{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.rows.map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-[#16233d]" : "bg-[#182545]"}>
                <td className="px-4 py-3 text-[#f3ecdb]">{row.label}</td>
                <td className="px-4 py-3 text-center"><CellIcon v={row.authorloft} /></td>
                {row.competitors.map((c, j) => (
                  <td key={j} className="px-4 py-3 text-center"><CellIcon v={c} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
