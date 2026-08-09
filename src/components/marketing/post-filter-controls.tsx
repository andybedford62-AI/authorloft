"use client";

import { Search, ChevronDown } from "lucide-react";
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
  "appearance-none text-sm font-medium text-[#1B2B47] bg-white border border-[#DCDBD3] rounded-full pl-4 pr-9 py-2 cursor-pointer hover:border-[#D4AE6A] transition-colors";

export function PostFilterControls({
  search, onSearch, categories, category, onCategory, sort, onSort,
  years, year, onYear, resultCount, total, isFiltering, onReset,
  searchPlaceholder = "Search by title, summary, or category…",
}: PostFilterControlsProps) {
  return (
    <div className="mb-8">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-x-7 gap-y-1 border-b border-[#DCDBD3]">
        <button
          type="button"
          onClick={() => onCategory("")}
          className={`relative pb-3.5 text-sm font-semibold transition-colors ${
            category === "" ? "text-[#1B2B47]" : "text-[#5C6E89] hover:text-[#1B2B47]"
          }`}
        >
          All
          <span
            className={`absolute left-0 right-0 -bottom-px h-0.5 bg-[#D4AE6A] origin-left transition-transform duration-200 ${
              category === "" ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategory(c)}
            className={`relative pb-3.5 text-sm font-semibold transition-colors ${
              category === c ? "text-[#1B2B47]" : "text-[#5C6E89] hover:text-[#1B2B47]"
            }`}
          >
            {c}
            <span
              className={`absolute left-0 right-0 -bottom-px h-0.5 bg-[#D4AE6A] origin-left transition-transform duration-200 ${
                category === c ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-5 mt-5">
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[#5C6E89]">
          {resultCount === 0 ? "No results" : `Showing ${resultCount} of ${total}`}
          {category ? ` in ${category}` : ""}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 border-b-[1.5px] border-[#DCDBD3] focus-within:border-[#D4AE6A] py-1.5 min-w-[220px] transition-colors">
            <Search className="h-4 w-4 text-[#5C6E89]" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label="Search"
              className="border-none outline-none bg-transparent text-sm w-full placeholder:text-[#5C6E89]"
            />
          </label>
          {years && years.length > 0 && onYear && (
            <div className="relative">
              <select
                value={year ?? ""}
                onChange={(e) => onYear(e.target.value)}
                aria-label="Filter by year"
                className={selectCls}
              >
                <option value="">All years</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5C6E89] pointer-events-none" />
            </div>
          )}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSort(e.target.value as SortKey)}
              aria-label="Sort"
              className={selectCls}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5C6E89] pointer-events-none" />
          </div>
        </div>
      </div>

      {isFiltering && (
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold uppercase tracking-[0.1em] text-[#B8893D] hover:text-[#1B2B47] transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
