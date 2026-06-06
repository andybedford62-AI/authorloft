"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { BookstoreBookCard, type BookstoreBook } from "@/components/marketing/bookstore-book-card";

const PER_PAGE = 24;

const FORMAT_OPTIONS: { id: string; label: string }[] = [
  { id: "EBOOK", label: "eBook" },
  { id: "PAPERBACK", label: "Paperback" },
  { id: "HARDBACK", label: "Hardback" },
  { id: "AUDIOBOOK", label: "Audiobook" },
];

type PriceFilter = "all" | "free" | "u5" | "u10" | "u20";
const PRICE_OPTIONS: { id: PriceFilter; label: string }[] = [
  { id: "all", label: "Any price" },
  { id: "free", label: "Free" },
  { id: "u5", label: "Under $5" },
  { id: "u10", label: "Under $10" },
  { id: "u20", label: "Under $20" },
];

type SortKey = "featured" | "newest" | "az" | "rated";
const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "az", label: "Title A–Z" },
  { id: "rated", label: "Highest Rated" },
];

export function BookstoreGrid({
  books,
  allGenres,
}: {
  books: BookstoreBook[];
  allGenres: string[];
}) {
  const [search, setSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]); // lowercased genre names
  const [format, setFormat] = useState<string>("all");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);

  // Only show format chips for formats that actually appear in the catalog
  const availableFormats = useMemo(() => {
    const present = new Set<string>();
    for (const b of books) for (const f of b.formats) present.add(f);
    return FORMAT_OPTIONS.filter((o) => present.has(o.id));
  }, [books]);

  function toggleGenre(name: string) {
    const key = name.toLowerCase();
    setSelectedGenres((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    );
    setPage(1);
  }

  function resetAll() {
    setSearch("");
    setSelectedGenres([]);
    setFormat("all");
    setPrice("all");
    setSort("featured");
    setPage(1);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const result = books.filter((b) => {
      // Combined search: title + author + genre names
      if (q) {
        const haystack = [b.title, b.authorName, ...b.genres].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Genre chips (book must have ALL selected genres)
      if (selectedGenres.length > 0) {
        const bookGenreKeys = b.genres.map((g) => g.toLowerCase());
        if (!selectedGenres.every((g) => bookGenreKeys.includes(g))) return false;
      }
      // Format
      if (format !== "all" && !b.formats.includes(format)) return false;
      // Price
      if (price !== "all") {
        if (b.priceCents === null) return false;
        if (price === "free" && b.priceCents !== 0) return false;
        if (price === "u5" && b.priceCents >= 500) return false;
        if (price === "u10" && b.priceCents >= 1000) return false;
        if (price === "u20" && b.priceCents >= 2000) return false;
      }
      return true;
    });

    // Sort
    const sorted = [...result];
    if (sort === "newest") {
      sorted.sort((a, b) => b.sortTimestamp - a.sortTimestamp);
    } else if (sort === "az") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "rated") {
      sorted.sort((a, b) => {
        const ar = a.averageRating ?? -1;
        const br = b.averageRating ?? -1;
        if (br !== ar) return br - ar;
        return b.ratingCount - a.ratingCount;
      });
    }
    // "featured" keeps the server order (newest-created first)
    return sorted;
  }, [books, search, selectedGenres, format, price, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const hasActiveFilters =
    !!search || selectedGenres.length > 0 || format !== "all" || price !== "all";

  const selectClass =
    "rounded-lg border border-[#DCDBD3] bg-white px-3 py-2 text-sm text-[#1B2B47] shadow-sm focus:border-[#C26A4A] focus:outline-none focus:ring-1 focus:ring-[#C26A4A]";

  return (
    <div>
      {/* ── Controls ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#DCDBD3] p-4 sm:p-5 mb-8 space-y-4">
        {/* Search + selects */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9b8e7e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by title, author, or genre…"
              className="w-full rounded-lg border border-[#DCDBD3] bg-white pl-9 pr-3 py-2 text-sm text-[#1B2B47] shadow-sm focus:border-[#C26A4A] focus:outline-none focus:ring-1 focus:ring-[#C26A4A]"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {availableFormats.length > 0 && (
              <select
                value={format}
                onChange={(e) => { setFormat(e.target.value); setPage(1); }}
                className={selectClass}
                aria-label="Filter by format"
              >
                <option value="all">All formats</option>
                {availableFormats.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            )}

            <select
              value={price}
              onChange={(e) => { setPrice(e.target.value as PriceFilter); setPage(1); }}
              className={selectClass}
              aria-label="Filter by price"
            >
              {PRICE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}
              className={selectClass}
              aria-label="Sort books"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Genre chips */}
        {allGenres.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9b8e7e] mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Genres:
            </span>
            {allGenres.map((g) => {
              const active = selectedGenres.includes(g.toLowerCase());
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    active
                      ? "bg-[#C26A4A] text-white border-[#C26A4A]"
                      : "bg-white text-[#5C6E89] border-[#DCDBD3] hover:border-[#C26A4A]"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Results header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#5C6E89]">
          {filtered.length === 0
            ? "No books found"
            : `Showing ${pageItems.length} of ${filtered.length} book${filtered.length !== 1 ? "s" : ""}`}
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#C26A4A] hover:text-[#1B2B47] transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      {/* ── Grid / empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-[#DCDBD3]">
          <BookOpen className="h-10 w-10 text-[#D4DDEB] mx-auto mb-4" />
          <p className="text-[#5C6E89] mb-4">
            {books.length === 0
              ? "The bookstore shelf is being stocked. Check back soon!"
              : "No books match your filters."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#C26A4A] px-4 py-2 rounded-full hover:bg-[#a8573a] transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {pageItems.map((b) => (
            <BookstoreBookCard key={b.id} book={b} />
          ))}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#DCDBD3] bg-white text-sm text-[#5C6E89] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#C26A4A] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`min-w-9 px-3 py-2 rounded-lg border text-sm transition-colors ${
                n === currentPage
                  ? "bg-[#1B2B47] text-white border-[#1B2B47]"
                  : "bg-white text-[#5C6E89] border-[#DCDBD3] hover:border-[#C26A4A]"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[#DCDBD3] bg-white text-sm text-[#5C6E89] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#C26A4A] transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
