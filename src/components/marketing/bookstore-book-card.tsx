"use client";

import { useState } from "react";
import { Star, BookOpen, Sparkles, Eye } from "lucide-react";
import { BookstoreQuickView } from "@/components/marketing/bookstore-quick-view";

export type BookstoreBook = {
  id: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  authorName: string;
  authorUrl: string;      // absolute URL to the author's own site root
  bookUrl: string;        // absolute URL to the book page on the author's own site
  description: string | null; // stripped plain-text blurb (for quick-view)
  genres: string[];
  formats: string[];      // EBOOK | PAPERBACK | HARDBACK | AUDIOBOOK
  priceCents: number | null;
  averageRating: number | null;
  ratingCount: number;
  isNew: boolean;
  isPreOrder: boolean;
  featured: boolean;      // Premium author — priority placement + ribbon
  views: number;          // for "Trending" row
  authorBookCount: number;// how many of this author's books are in the store
  sortTimestamp: number;  // for "Newest" sort (releaseDate ?? createdAt)
};

function formatPrice(cents: number | null): string | null {
  if (cents === null) return null;
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

export function BookstoreBookCard({
  book,
  compact = false,
  quickView = false,
}: {
  book: BookstoreBook;
  compact?: boolean;
  quickView?: boolean;
}) {
  const [qvOpen, setQvOpen] = useState(false);
  const price = formatPrice(book.priceCents);
  const isFree = book.priceCents === 0;

  // One priority badge keeps the cover clean.
  const badge = book.featured
    ? { label: "Featured", icon: true, cls: "text-[#3a2417] bg-gradient-to-r from-[#E8B04B] to-[#D4AE6A]" }
    : book.isNew
    ? { label: "New", icon: false, cls: "text-[#1B2B47] bg-[#F0D9B5]" }
    : book.isPreOrder
    ? { label: "Coming Soon", icon: false, cls: "text-white bg-[#5C6E89]" }
    : null;

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl border border-[#DCDBD3] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Cover (portrait 2:3) */}
      <div className="relative w-full aspect-[2/3] bg-[#E8E2D5] overflow-hidden">
        {book.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={book.coverImageUrl}
            alt={book.title}
            loading="lazy"
            className="h-full w-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-[#B6A88F]">
            <BookOpen className="h-10 w-10" />
            <span className="text-xs font-serif italic px-4 text-center line-clamp-3">{book.title}</span>
          </div>
        )}

        {/* Single priority badge — never the price (price lives in the body now) */}
        {!compact && badge && (
          <span className={`absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-sm ${badge.cls}`}>
            {badge.icon && <Sparkles className="h-2.5 w-2.5" />}
            {badge.label}
          </span>
        )}
      </div>

      {/* Body */}
      <div className={`flex flex-col flex-1 ${compact ? "p-2.5" : "p-4"}`}>
        <h3 className={`font-serif text-[#1B2B47] leading-snug line-clamp-2 ${compact ? "text-sm" : "text-base"}`}>
          <a
            href={book.bookUrl}
            className="group-hover:text-[#C26A4A] transition-colors after:absolute after:inset-0 after:z-0"
          >
            {book.title}
          </a>
        </h3>
        <p className="text-xs text-[#9b8e7e] mt-1">
          by{" "}
          <a
            href={book.authorUrl}
            className="relative z-10 text-[#5C6E89] hover:text-[#C26A4A] hover:underline"
          >
            {book.authorName}
          </a>
          {!compact && book.authorBookCount > 1 && (
            <span className="text-[#b6a88f]"> · {book.authorBookCount} books</span>
          )}
        </p>

        {/* Rating + price — price now lives in the body alongside the book data */}
        {compact ? (
          price && (
            <p className={`text-xs font-semibold mt-1 ${isFree ? "text-[#3B6D11]" : "text-[#1B2B47]"}`}>{price}</p>
          )
        ) : (
          (book.ratingCount > 0 || price) && (
            <div className="flex items-center justify-between gap-2 mt-2">
              {book.ratingCount > 0 && book.averageRating !== null ? (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-3.5 w-3.5 ${
                          n <= Math.round(book.averageRating!)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#9b8e7e]">{book.averageRating.toFixed(1)}</span>
                </div>
              ) : (
                <span />
              )}
              {price && (
                <span className={`text-sm font-semibold ${isFree ? "text-[#3B6D11]" : "text-[#1B2B47]"}`}>{price}</span>
              )}
            </div>
          )
        )}

        {/* Quick view — standalone action, sits above the card's stretched link */}
        {!compact && quickView && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQvOpen(true); }}
            className="relative z-10 mt-auto pt-3 border-t border-[#F0EDE4] self-start inline-flex items-center gap-1 text-xs font-medium text-[#5C6E89] hover:text-[#C26A4A] transition-colors"
            aria-label={`Quick view: ${book.title}`}
          >
            <Eye className="h-3.5 w-3.5" /> Quick view
          </button>
        )}
      </div>

      {quickView && (
        <BookstoreQuickView book={qvOpen ? book : null} onClose={() => setQvOpen(false)} />
      )}
    </div>
  );
}
