import { Star, BookOpen, Eye, Sparkles } from "lucide-react";
import type { BookstoreBook } from "@/components/marketing/bookstore-book-card";

function formatPrice(cents: number | null): string | null {
  if (cents === null) return null;
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Compact horizontal "list" card for the All Books grid: cover on the left,
 * title / author / rating / genres on the right. No price or buy CTA — those
 * live in the Quick View modal and on the book page. The whole card links to
 * the book; the author name links separately; Quick View opens on hover
 * (always visible on touch devices).
 */
export function BookstoreListCard({
  book,
  onQuickView,
}: {
  book: BookstoreBook;
  onQuickView?: (book: BookstoreBook) => void;
}) {
  // One priority badge to keep the compact card uncluttered.
  const badge = book.featured
    ? { label: "Featured", icon: true, cls: "text-[#3a2417] bg-gradient-to-r from-[#E8B04B] to-[#D4AE6A]" }
    : book.isNew
    ? { label: "New", icon: false, cls: "text-[#1B2B47] bg-[#F0D9B5]" }
    : book.isPreOrder
    ? { label: "Soon", icon: false, cls: "text-white bg-[#5C6E89]" }
    : null;

  const price = formatPrice(book.priceCents);

  return (
    <div className="group relative flex gap-3.5 bg-white rounded-xl border border-[#DCDBD3] p-3 hover:border-[#C26A4A] hover:shadow-sm transition-all">
      {/* Cover */}
      <div className="relative w-[88px] sm:w-24 flex-shrink-0 aspect-[2/3] rounded-md bg-[#E8E2D5] overflow-hidden">
        {book.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={book.coverImageUrl}
            alt={book.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-[#B6A88F]">
            <BookOpen className="h-8 w-8" />
          </div>
        )}

        {badge && (
          <span className={`absolute top-1 left-1 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-sm ${badge.cls}`}>
            {badge.icon && <Sparkles className="h-2 w-2" />}
            {badge.label}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-serif text-sm text-[#1B2B47] leading-snug line-clamp-2">
          <a
            href={book.bookUrl}
            className="group-hover:text-[#C26A4A] transition-colors after:absolute after:inset-0 after:z-0"
          >
            {book.title}
          </a>
        </h3>
        <div className="flex items-baseline justify-between gap-2 mt-0.5">
          <p className="text-xs text-[#9b8e7e] truncate">
            by{" "}
            <a
              href={book.authorUrl}
              className="relative z-10 text-[#5C6E89] hover:text-[#C26A4A] hover:underline"
            >
              {book.authorName}
            </a>
          </p>
          {price && (
            <span className={`text-xs font-semibold flex-shrink-0 ${book.priceCents === 0 ? "text-[#3B6D11]" : "text-[#1B2B47]"}`}>
              {price}
            </span>
          )}
        </div>

        {book.ratingCount > 0 && book.averageRating !== null && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`h-3 w-3 ${
                    n <= Math.round(book.averageRating!)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#9b8e7e]">{book.averageRating.toFixed(1)}</span>
          </div>
        )}

        {book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] text-[#5C6E89] bg-[#F0EDE4] rounded-full px-2 py-0.5">
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Quick view — standalone button, sits above the card's stretched link */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(book); }}
            className="relative z-10 mt-auto pt-2 self-start inline-flex items-center gap-1 text-xs font-medium text-[#5C6E89] hover:text-[#C26A4A] transition-colors"
            aria-label={`Quick view: ${book.title}`}
          >
            <Eye className="h-3.5 w-3.5" /> Quick view
          </button>
        )}
      </div>
    </div>
  );
}
