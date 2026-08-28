import { Star, BookOpen, Eye } from "lucide-react";
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
  // One priority badge to keep the compact card uncluttered. "Featured" (Premium
  // tier) deliberately omitted here — this grid is the plain catalog listing,
  // not a promotional row, so every book shows on equal footing.
  const badge = book.isNew
    ? { label: "New", cls: "text-vault-bg bg-vault-gold-light" }
    : book.isPreOrder
    ? { label: "Soon", cls: "text-vault-ink bg-vault-surf-2" }
    : null;

  const price = formatPrice(book.priceCents);

  return (
    <div className="group relative flex gap-3.5 bg-vault-surf-2 rounded-xl border border-vault-ink/22 shadow-[0_1px_4px_rgba(0,0,0,0.3)] p-3 hover:border-vault-gold hover:shadow-[0_4px_14px_rgba(0,0,0,0.4)] transition-all">
      {/* Cover */}
      <div className="relative w-[88px] sm:w-24 flex-shrink-0 aspect-[2/3] rounded-md bg-vault-bg overflow-hidden">
        {book.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={book.coverImageUrl}
            alt={book.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-vault-mute">
            <BookOpen className="h-8 w-8" />
          </div>
        )}

        {badge && (
          <span className={`absolute top-1 left-1 inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-sm ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-vault-display text-sm text-vault-ink leading-snug line-clamp-2">
          <a
            href={book.bookUrl}
            className="group-hover:text-vault-gold transition-colors after:absolute after:inset-0 after:z-0"
          >
            {book.title}
          </a>
        </h3>
        <div className="flex items-baseline justify-between gap-2 mt-0.5">
          <p className="text-xs text-vault-mute truncate">
            by{" "}
            <a
              href={book.authorUrl}
              className="relative z-10 text-vault-mute hover:text-vault-gold hover:underline"
            >
              {book.authorName}
            </a>
          </p>
          {price && (
            <span className={`text-xs font-semibold flex-shrink-0 ${book.priceCents === 0 ? "text-vault-good" : "text-vault-ink"}`}>
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
                      : "text-vault-ink/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-vault-mute">{book.averageRating.toFixed(1)}</span>
          </div>
        )}

        {book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] text-vault-mute bg-vault-surf-2 rounded-full px-2 py-0.5">
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
            className="relative z-10 mt-auto pt-2 self-start inline-flex items-center gap-1 text-xs font-medium text-vault-mute hover:text-vault-gold transition-colors"
            aria-label={`Quick view: ${book.title}`}
          >
            <Eye className="h-3.5 w-3.5" /> Quick view
          </button>
        )}
      </div>
    </div>
  );
}
