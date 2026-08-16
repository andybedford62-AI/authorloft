"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  // Render into document.body via portal so the fixed-position overlay escapes
  // any transformed ancestor (e.g. card hover translate) that would otherwise
  // turn `position: fixed` into "fixed within that ancestor" and clip the modal.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  if (!book || !mounted) return null;

  const price = formatPrice(book.priceCents);

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${book.title} details`}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1e2f4d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-[#16233d]/90 p-1.5 text-[#93a0bc] shadow-sm hover:text-[#f3ecdb] hover:bg-[#16233d] transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
          {/* Cover */}
          <div className="mx-auto sm:mx-0 w-36 sm:w-44 flex-shrink-0">
            <div className="relative w-full aspect-[2/3] rounded-xl bg-[#16233d] overflow-hidden border border-[rgba(243,236,219,0.12)]">
              {book.coverImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={book.coverImageUrl} alt={book.title} className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-[#93a0bc]">
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
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#16233d] bg-gradient-to-r from-[#e2bc6e] to-[#d6a94a] px-2 py-0.5 rounded-full">
                  <Sparkles className="h-2.5 w-2.5" /> Featured
                </span>
              )}
              {book.isNew && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16233d] bg-[#e2bc6e] px-2 py-0.5 rounded-full">New</span>
              )}
              {book.isPreOrder && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#f3ecdb] bg-[#243756] px-2 py-0.5 rounded-full">Coming Soon</span>
              )}
            </div>

            <h2 className="font-serif italic text-xl sm:text-2xl text-[#f3ecdb] leading-snug">{book.title}</h2>
            {book.subtitle && <p className="text-sm text-[#93a0bc] mt-0.5">{book.subtitle}</p>}

            <p className="text-sm text-[#93a0bc] mt-2">
              by{" "}
              <a href={book.authorUrl} className="text-[#93a0bc] hover:text-[#d6a94a] hover:underline">
                {book.authorName}
              </a>
            </p>

            {book.ratingCount > 0 && book.averageRating !== null && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${n <= Math.round(book.averageRating!) ? "fill-amber-400 text-amber-400" : "text-[rgba(243,236,219,0.2)]"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#93a0bc]">{book.averageRating.toFixed(1)} ({book.ratingCount})</span>
              </div>
            )}

            {price && (
              <p className="mt-3 text-lg font-semibold text-[#f3ecdb]">{price}</p>
            )}

            {book.formats.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {book.formats.map((f) => (
                  <span key={f} className="text-[10px] font-medium uppercase tracking-wide text-[#93a0bc] bg-[#243756] border border-[rgba(243,236,219,0.12)] px-1.5 py-0.5 rounded">
                    {FORMAT_LABELS[f] ?? f}
                  </span>
                ))}
              </div>
            )}

            {book.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {book.genres.map((g) => (
                  <span key={g} className="text-xs text-[#93a0bc] bg-[#243756] rounded-full px-2.5 py-0.5">{g}</span>
                ))}
              </div>
            )}

            {book.description && (
              <p className="text-sm text-[#93a0bc] leading-relaxed mt-4 line-clamp-6">{book.description}</p>
            )}

            <a
              href={book.bookUrl}
              className="mt-5 inline-flex items-center gap-1.5 bg-[#d6a94a] text-[#16233d] text-sm font-medium px-5 py-2.5 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
            >
              Buy on Author&apos;s Site <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
