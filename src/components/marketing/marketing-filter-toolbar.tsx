"use client";

import { Search as SearchIcon, ChevronDown, X } from "lucide-react";

export type SortOption = { id: string; label: string };

/**
 * Shared filter/search/sort toolbar for marketing content index pages
 * (Learn, Blog, FAQ, Resources) so category pills, search, sort, and the
 * "Showing X of Y" count look and behave identically everywhere.
 */
export function MarketingFilterToolbar({
  categories,
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  sortOptions,
  sortValue,
  onSortChange,
  resultCount,
  totalCount,
  itemLabel = "results",
  variant = "light",
}: {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  resultCount: number;
  totalCount: number;
  itemLabel?: string;
  /** "dark" adapts colors for pages with a dark/navy background (e.g. Resources). */
  variant?: "light" | "dark";
}) {
  const hasActiveFilters = !!activeCategory || !!search.trim();
  const dark = variant === "dark";

  function clearAll() {
    onCategoryChange("");
    onSearchChange("");
  }

  return (
    <div className="mb-10">
      {/* Category pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            type="button"
            onClick={() => onCategoryChange("")}
            className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === ""
                ? dark ? "bg-[#d6a94a] text-[#16233d] border-[#d6a94a]" : "bg-[#1e2f4d] text-[#f3ecdb] border-[#1e2f4d]"
                : dark ? "bg-white/5 text-white/60 border-white/15 hover:border-[#d6a94a]/60 hover:text-[#d6a94a]" : "bg-white text-[#5C6E89] border-[#DCDBD3] hover:border-[#C26A4A]/50 hover:text-[#C26A4A]"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCategoryChange(c)}
              className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === c
                  ? dark ? "bg-[#d6a94a] text-[#16233d] border-[#d6a94a]" : "bg-[#1e2f4d] text-[#f3ecdb] border-[#1e2f4d]"
                  : dark ? "bg-white/5 text-white/60 border-white/15 hover:border-[#d6a94a]/60 hover:text-[#d6a94a]" : "bg-white text-[#5C6E89] border-[#DCDBD3] hover:border-[#C26A4A]/50 hover:text-[#C26A4A]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Search + sort + count row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className={`text-[0.8rem] font-semibold uppercase tracking-[0.12em] ${dark ? "text-white/50" : "text-[#5C6E89]"}`}>
          Showing {resultCount} of {totalCount} {itemLabel}
          {activeCategory ? ` in ${activeCategory}` : ""}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <label className={`flex items-center gap-2 border-b-[1.5px] py-1.5 min-w-[220px] transition-colors ${dark ? "border-white/15 focus-within:border-[#d6a94a]" : "border-[#DCDBD3] focus-within:border-[#d6a94a]"}`}>
            <SearchIcon className={`h-4 w-4 ${dark ? "text-white/50" : "text-[#5C6E89]"}`} />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className={`border-none outline-none bg-transparent text-sm w-full ${dark ? "text-white placeholder:text-white/40" : "placeholder:text-[#5C6E89]"}`}
            />
          </label>

          {sortOptions && sortOptions.length > 0 && onSortChange && (
            <div className="relative">
              <select
                value={sortValue}
                onChange={(e) => onSortChange(e.target.value)}
                aria-label="Sort"
                className={`appearance-none text-sm font-medium rounded-full pl-4 pr-9 py-2 cursor-pointer transition-colors ${
                  dark ? "text-white bg-white/5 border border-white/15 hover:border-[#d6a94a]" : "text-[#1B2B47] bg-white border border-[#DCDBD3] hover:border-[#d6a94a]"
                }`}
              >
                {sortOptions.map((o) => (
                  <option key={o.id} value={o.id} className="text-[#1B2B47]">{o.label}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none ${dark ? "text-white/50" : "text-[#5C6E89]"}`} />
            </div>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${dark ? "text-[#d6a94a] hover:text-white" : "text-[#B8893D] hover:text-[#C26A4A]"}`}
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
