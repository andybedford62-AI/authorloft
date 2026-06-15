import { Star, BookOpen, Eye, Sparkles } from "lucide-react";
import type { BookstoreBook } from "@/components/marketing/bookstore-book-card";

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

  return (
    <div className="group relative flex gap-3 bg-white rounded-xl border border-[#DCDBD3] p-3 hover:border-[#C26A4A] hover:shadow-sm transition-all">
      {/* Cover */}
      <div className="relative w-[58px] sm:w-16 flex-shrink-0 aspect-[2/3] rounded-md bg-[#E8E2D5] overflow-hidden">
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
            <BookOpen className="h-6 w-6" />
          </div>
        )}

        {badge && (
          <span className={`absolute top-1 left-1 inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-sm ${badge.cls}`}>
            {badge.icon && <Sparkles className="h-2 w-2" />}
            {badge.label}
          </span>
        )}

        {/* Quick view — revealed on hover (hover-capable devices), always shown on touch */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(book); }}
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-1 bg-white/90 backdrop-blur-sm py-1 text-[10px] font-medium text-[#1B2B47] opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
            aria-label={`Quick view: ${book.title}`}
          >
            <Eye className="h-3 w-3" /> Quick view
          </button>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-sm text-[#1B2B47] leading-snug line-clamp-2">
          <a
            href={book.bookUrl}
            className="group-hover:text-[#C26A4A] transition-colors after:absolute after:inset-0 after:z-0"
          >
            {book.title}
          </a>
        </h3>
        <p className="text-xs text-[#9b8e7e] mt-0.5 truncate">
          by{" "}
          <a
            href={book.authorUrl}
            className="relative z-10 text-[#5C6E89] hover:text-[#C26A4A] hover:underline"
          >
            {book.authorName}
          </a>
        </p>

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
      </div>
    </div>
  );
}
