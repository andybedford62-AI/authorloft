"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { BookCard, type RetailerLinkPublic, type DirectSaleItemPublic } from "@/components/author-site/book-card";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Book {
  id: string; title: string; slug: string; subtitle?: string | null;
  shortDescription?: string | null; coverImageUrl?: string | null;
  priceCents: number; isFeatured: boolean;
  externalBuyUrl?: string | null; seriesId?: string | null;
  seriesName?: string | null; seriesSlug?: string | null;
  genreIds: string[]; salesEnabled: boolean;
  directSalesEnabled?: boolean;
  retailerLinks?: RetailerLinkPublic[];
  directSaleItems?: DirectSaleItemPublic[];
}

interface Props {
  books: Book[];
  series: { id: string; name: string; slug: string }[];
  genres: { id: string; name: string }[];
  authorName: string;
  authorSlug: string;
  accentColor: string;
  hideHeader?: boolean;
}

type PerPage = 5 | 10 | 25 | 0; // 0 = All

const PER_PAGE_OPTIONS: { value: PerPage; label: string }[] = [
  { value: 5,  label: "5"   },
  { value: 10, label: "10"  },
  { value: 25, label: "25"  },
  { value: 0,  label: "All" },
];

// ── Pagination bar ─────────────────────────────────────────────────────────────

function PaginationBar({
  currentPage,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  perPage,
  accentColor,
  onPrev,
  onNext,
  onPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  perPage: PerPage;
  accentColor: string;
  onPrev: () => void;
  onNext: () => void;
  onPerPageChange: (v: PerPage) => void;
}) {
  const showingAll = perPage === 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">

      {/* Left: count info */}
      <p className="text-sm text-gray-500 order-2 sm:order-1">
        {showingAll
          ? <>Showing all <span className="font-medium text-gray-700">{totalItems}</span> books</>
          : totalItems === 0
          ? "No books match your filters"
          : <>
              Showing{" "}
              <span className="font-medium text-gray-700">{rangeStart}–{rangeEnd}</span>
              {" "}of{" "}
              <span className="font-medium text-gray-700">{totalItems}</span>
              {" "}books
            </>
        }
      </p>

      {/* Right: per-page selector + prev/next */}
      <div className="flex items-center gap-3 order-1 sm:order-2">
        {/* Per-page selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">Show:</label>
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value) as PerPage)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700
                       focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer"
            style={{ focusRingColor: accentColor } as React.CSSProperties}
          >
            {PER_PAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Prev / Next — hidden when showing all */}
        {!showingAll && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-sm
                         text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40
                         disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <span className="px-3 py-1.5 text-sm text-gray-600 select-none">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={onNext}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 text-sm
                         text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40
                         disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BooksClient({
  books,
  series,
  genres,
  authorName,
  authorSlug,
  accentColor,
  hideHeader = false,
}: Props) {
  const [search,         setSearch]         = useState("");
  const [selectedGenre,  setSelectedGenre]  = useState<string | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [showFilters,    setShowFilters]    = useState(false);
  const [perPage,        setPerPage]        = useState<PerPage>(5);
  const [currentPage,    setCurrentPage]    = useState(1);

  // Reset to page 1 whenever filters or perPage changes
  useEffect(() => { setCurrentPage(1); }, [search, selectedGenre, selectedSeries, perPage]);

  const filtered = useMemo(() =>
    books.filter((book) => {
      const matchesSearch  = !search         || book.title.toLowerCase().includes(search.toLowerCase()) ||
                             book.shortDescription?.toLowerCase().includes(search.toLowerCase());
      const matchesGenre   = !selectedGenre  || book.genreIds.includes(selectedGenre);
      const matchesSeries  = !selectedSeries || book.seriesId === selectedSeries;
      return matchesSearch && matchesGenre && matchesSeries;
    }),
  [search, selectedGenre, selectedSeries, books]);

  // Pagination calculations
  const totalItems  = filtered.length;
  const showingAll  = perPage === 0;
  const totalPages  = showingAll ? 1 : Math.max(1, Math.ceil(totalItems / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const rangeStart  = showingAll ? 1          : (safeCurrentPage - 1) * perPage + 1;
  const rangeEnd    = showingAll ? totalItems  : Math.min(safeCurrentPage * perPage, totalItems);
  const paginated   = showingAll ? filtered    : filtered.slice(rangeStart - 1, rangeEnd);

  const hasActiveFilters = selectedGenre || selectedSeries || search;

  function clearFilters() {
    setSearch(""); setSelectedGenre(null); setSelectedSeries(null);
  }

  const paginationProps = {
    currentPage: safeCurrentPage,
    totalPages,
    totalItems,
    rangeStart,
    rangeEnd,
    perPage,
    accentColor,
    onPrev:          () => setCurrentPage((p) => Math.max(1, p - 1)),
    onNext:          () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    onPerPageChange: (v: PerPage) => setPerPage(v),
  };

  return (
    <div
      style={{ "--accent": accentColor } as React.CSSProperties}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-12"
    >
      {/* Header */}
      {!hideHeader && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Books</h1>
          <p className="text-gray-500">
            {books.length} title{books.length !== 1 ? "s" : ""} by {authorName}
          </p>
        </div>
      )}

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search books…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 text-sm
                       focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-1 text-gray-500">
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          {genres.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Genre / Category</p>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(selectedGenre === genre.id ? null : genre.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      selectedGenre === genre.id
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-white text-gray-600 border-gray-300 hover:border-[var(--accent)]"
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {series.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Series</p>
              <div className="flex flex-wrap gap-2">
                {series.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSeries(selectedSeries === s.id ? null : s.id)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      selectedSeries === s.id
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-white text-gray-600 border-gray-300 hover:border-[var(--accent)]"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Top pagination bar ─────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 mb-1">
        <PaginationBar {...paginationProps} />
      </div>

      {/* ── Book list ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-500">No books match your filters.</p>
          <Button variant="ghost" className="mt-3" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {paginated.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              accentColor={accentColor}
              authorSlug={authorSlug}
              layout="list"
            />
          ))}
        </div>
      )}

      {/* ── Bottom pagination bar ──────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="border-t border-gray-100 mt-1">
          <PaginationBar {...paginationProps} />
        </div>
      )}
    </div>
  );
}
