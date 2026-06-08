"use client";

import { Search, X } from "lucide-react";
import type { SortKey } from "./use-post-filters";

interface PostFilterControlsProps {
  search: string;
  onSearch: (v: string) => void;
  categories: string[];
  category: string;
  onCategory: (v: string) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  /** Pass years to show a year dropdown (used on News). Omit to hide. */
  years?: string[];
  year?: string;
  onYear?: (v: string) => void;
  resultCount: number;
  total: number;
  isFiltering: boolean;
  onReset: () => void;
  searchPlaceholder?: string;
}

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "az", label: "Title A–Z" },
];

const selectCls =
  "rounded-lg border border-[#DCDBD3] bg-white px-3 py-2 text-sm text-[#1B2B47] shadow-sm focus:border-[#C26A4A] focus:outline-none focus:ring-1 focus:ring-[#C26A4A]";

export function PostFilterControls({
  search, onSearch, categories, category, onCategory, sort, onSort,
  years, year, onYear, resultCount, total, isFiltering, onReset,
  searchPlaceholder = "Search by title, summary, or category…",
}: PostFilterControlsProps) {
  return (
    <div className="mb-8">
      {/* Prominent search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#C26A4A]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border-2 border-[#DCDBD3] bg-white pl-12 pr-4 py-3 text-base text-[#1B2B47] shadow-sm transition-all focus:border-[#C26A4A] focus:outline-none focus:ring-2 focus:ring-[#C26A4A]/20"
        />
      </div>

      {/* Category chips + sort/year */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onCategory("")}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                category === ""
                  ? "bg-[#C26A4A] text-white border-[#C26A4A]"
                  : "bg-white text-[#5C6E89] border-[#DCDBD3] hover:border-[#C26A4A]"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCategory(category === c ? "" : c)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  category === c
                    ? "bg-[#C26A4A] text-white border-[#C26A4A]"
                    : "bg-white text-[#5C6E89] border-[#DCDBD3] hover:border-[#C26A4A]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {years && years.length > 0 && onYear && (
            <select value={year ?? ""} onChange={(e) => onYear(e.target.value)} className={selectCls} aria-label="Filter by year">
              <option value="">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
          <select value={sort} onChange={(e) => onSort(e.target.value as SortKey)} className={selectCls} aria-label="Sort">
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-[#5C6E89]">
          {resultCount === 0
            ? "No results"
            : `Showing ${resultCount} of ${total}`}
        </p>
        {isFiltering && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#C26A4A] hover:text-[#1B2B47] transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
