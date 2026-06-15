"use client";

import { useEffect } from "react";
import { Star, BookOpen, ArrowRight, X, Sparkles } from "lucide-react";
import type { BookstoreBook } from "@/components/marketing/bookstore-book-card";

const FORMAT_LABELS: Record<string, string> = {
  EBOOK: "eBook",
  PAPERBACK: "Paperback",
  HARDBACK: "Hardback",
  AUDIOBOOK: "Audiobook",
};

function formatPrice(cents: number | null): string | null {
  if (cents === null) return null;
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

/** Modal "peek" at a book — opens from a bookstore card, never leaves the store. */
export function BookstoreQuickView({
  book,
  onClose,
}: {
  book: BookstoreBook | null;
  onClose: () => void;
}) {
  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!book) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [book, onClose]);

  if (!book) return null;

  const price = formatPrice(book.priceCents);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${book.title} details`}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-1.5 text-[#5C6E89] shadow-sm hover:text-[#1B2B47] hover:bg-white transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
          {/* Cover */}
          <div className="mx-auto sm:mx-0 w-36 sm:w-44 flex-shrink-0">
            <div className="relative w-full aspect-[2/3] rounded-xl bg-[#E8E2D5] overflow-hidden border border-[#DCDBD3]">
              {book.coverImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={book.coverImageUrl} alt={book.title} className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-[#B6A88F]">
                  <BookOpen className="h-9 w-9" />
                  <span className="text-xs font-serif italic px-3 text-center line-clamp-3">{book.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {book.featured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#3a2417] bg-gradient-to-r from-[#E8B04B] to-[#D4AE6A] px-2 py-0.5 rounded-full">
                  <Sparkles className="h-2.5 w-2.5" /> Featured
                </span>
              )}
              {book.isNew && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B2B47] bg-[#F0D9B5] px-2 py-0.5 rounded-full">New</span>
              )}
              {book.isPreOrder && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#5C6E89] px-2 py-0.5 rounded-full">Coming Soon</span>
              )}
            </div>

            <h2 className="font-serif text-xl sm:text-2xl text-[#1B2B47] leading-snug">{book.title}</h2>
            {book.subtitle && <p className="text-sm text-[#5C6E89] mt-0.5">{book.subtitle}</p>}

            <p className="text-sm text-[#9b8e7e] mt-2">
              by{" "}
              <a href={book.authorUrl} className="text-[#5C6E89] hover:text-[#C26A4A] hover:underline">
                {book.authorName}
              </a>
            </p>

            {book.ratingCount > 0 && book.averageRating !== null && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${n <= Math.round(book.averageRating!) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#9b8e7e]">{book.averageRating.toFixed(1)} ({book.ratingCount})</span>
              </div>
            )}

            {price && (
              <p className="mt-3 text-lg font-semibold text-[#1B2B47]">{price}</p>
            )}

            {book.formats.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {book.formats.map((f) => (
                  <span key={f} className="text-[10px] font-medium uppercase tracking-wide text-[#5C6E89] bg-[#F0EDE4] border border-[#DCDBD3] px-1.5 py-0.5 rounded">
                    {FORMAT_LABELS[f] ?? f}
                  </span>
                ))}
              </div>
            )}

            {book.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {book.genres.map((g) => (
                  <span key={g} className="text-xs text-[#5C6E89] bg-[#F0EDE4] rounded-full px-2.5 py-0.5">{g}</span>
                ))}
              </div>
            )}

            {book.description && (
              <p className="text-sm text-[#5C6E89] leading-relaxed mt-4 line-clamp-6">{book.description}</p>
            )}

            <a
              href={book.bookUrl}
              className="mt-5 inline-flex items-center gap-1.5 bg-[#C26A4A] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#a8573a] transition-colors"
            >
              Buy on Author&apos;s Site <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
