"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { type BookstoreBook } from "@/components/marketing/bookstore-book-card";
import { BookstoreListCard } from "@/components/marketing/bookstore-list-card";
import { BookstoreQuickView } from "@/components/marketing/bookstore-quick-view";

const PER_PAGE_OPTIONS = [24, 48, 96] as const;

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

type SortKey = "newest" | "az" | "rated";
const SORT_OPTIONS: { id: SortKey; label: string }[] = [
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
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(PER_PAGE_OPTIONS[0]);
  const [quickViewBook, setQuickViewBook] = useState<BookstoreBook | null>(null);

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
    setSort("newest");
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

    // Sort (Array.sort is stable, so ties keep server order = newest-created first)
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
    return sorted;
  }, [books, search, selectedGenres, format, price, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const hasActiveFilters =
    !!search || selectedGenres.length > 0 || format !== "all" || price !== "all";

  const selectClass =
    "rounded-lg border border-[rgba(243,236,219,0.15)] bg-[#16233d] px-2.5 py-1.5 text-sm text-[#f3ecdb] shadow-sm focus:border-[#d6a94a] focus:outline-none focus:ring-1 focus:ring-[#d6a94a]";

  return (
    <div>
      {/* ── Search + filters — one compact bar instead of two stacked boxes ── */}
      <div className="bg-[#1e2f4d] rounded-xl border border-[rgba(243,236,219,0.12)] p-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d6a94a]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Find books by title, author, or genre…"
              className="w-full rounded-lg border border-[rgba(243,236,219,0.15)] bg-[#16233d] pl-9 pr-3 py-1.5 text-sm text-[#f3ecdb] placeholder-[#93a0bc] transition-all focus:border-[#d6a94a] focus:outline-none focus:ring-1 focus:ring-[#d6a94a]/30"
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
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[rgba(243,236,219,0.12)]">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#93a0bc] mr-0.5">
              <SlidersHorizontal className="h-3 w-3" /> Genres:
            </span>
            {allGenres.map((g) => {
              const active = selectedGenres.includes(g.toLowerCase());
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] border transition-colors ${
                    active
                      ? "bg-[#d6a94a] text-[#16233d] border-[#d6a94a]"
                      : "bg-[#16233d] text-[#93a0bc] border-[rgba(243,236,219,0.15)] hover:border-[#d6a94a]"
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
      <div className="flex items-center justify-between gap-3 mb-5">
        <p className="text-sm text-[#93a0bc]">
          {filtered.length === 0
            ? "No books found"
            : `Showing ${pageItems.length} of ${filtered.length} book${filtered.length !== 1 ? "s" : ""}`}
        </p>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#d6a94a] hover:text-[#f3ecdb] transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
          {filtered.length > PER_PAGE_OPTIONS[0] && (
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
              className={selectClass + " py-1.5"}
              aria-label="Books per page"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>Show {n}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Grid / empty state ─────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.12)]">
          <BookOpen className="h-10 w-10 text-[#93a0bc] mx-auto mb-4" />
          <p className="text-[#93a0bc] mb-4">
            {books.length === 0
              ? "The bookstore shelf is being stocked. Check back soon!"
              : "No books match your filters."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#16233d] bg-[#d6a94a] px-4 py-2 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {pageItems.map((b) => (
            <BookstoreListCard key={b.id} book={b} onQuickView={setQuickViewBook} />
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
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[rgba(243,236,219,0.15)] bg-[#1e2f4d] text-sm text-[#93a0bc] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#d6a94a] transition-colors"
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
                  ? "bg-[#d6a94a] text-[#16233d] border-[#d6a94a]"
                  : "bg-[#1e2f4d] text-[#93a0bc] border-[rgba(243,236,219,0.15)] hover:border-[#d6a94a]"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-[rgba(243,236,219,0.15)] bg-[#1e2f4d] text-sm text-[#93a0bc] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#d6a94a] transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <BookstoreQuickView book={quickViewBook} onClose={() => setQuickViewBook(null)} />
    </div>
  );
}
