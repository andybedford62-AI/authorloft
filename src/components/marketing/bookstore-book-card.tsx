import { Star, BookOpen, ArrowRight } from "lucide-react";

export type BookstoreBook = {
  id: string;
  title: string;
  subtitle: string | null;
  coverImageUrl: string | null;
  authorName: string;
  bookUrl: string;        // absolute URL to the book page on the author's own site
  genres: string[];
  formats: string[];      // EBOOK | PAPERBACK | HARDBACK | AUDIOBOOK
  priceCents: number | null;
  averageRating: number | null;
  ratingCount: number;
  isNew: boolean;
  sortTimestamp: number;  // for "Newest" sort (releaseDate ?? createdAt)
};

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

export function BookstoreBookCard({ book }: { book: BookstoreBook }) {
  const price = formatPrice(book.priceCents);

  return (
    <a
      href={book.bookUrl}
      className="group flex flex-col bg-white rounded-2xl border border-[#DCDBD3] overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Cover (portrait 2:3) */}
      <div className="relative w-full aspect-[2/3] bg-[#E8E2D5] overflow-hidden">
        {book.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={book.coverImageUrl}
            alt={book.title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-[#B6A88F]">
            <BookOpen className="h-10 w-10" />
            <span className="text-xs font-serif italic px-4 text-center line-clamp-3">{book.title}</span>
          </div>
        )}

        {/* NEW badge */}
        {book.isNew && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-[#1B2B47] bg-[#F0D9B5] px-2 py-1 rounded-full shadow-sm">
            New
          </span>
        )}

        {/* Price chip */}
        {price && (
          <span className="absolute top-2 right-2 text-xs font-semibold text-white bg-[#1B2B47]/85 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
            {price}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-serif text-base text-[#1B2B47] leading-snug line-clamp-2 group-hover:text-[#C26A4A] transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-[#9b8e7e] mt-1">
          by <span className="text-[#5C6E89]">{book.authorName}</span>
        </p>

        {/* Rating — hidden until the book has approved ratings */}
        {book.ratingCount > 0 && book.averageRating !== null && (
          <div className="flex items-center gap-1 mt-2">
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
            <span className="text-xs text-[#9b8e7e]">
              {book.averageRating.toFixed(1)} ({book.ratingCount})
            </span>
          </div>
        )}

        {/* Format badges */}
        {book.formats.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {book.formats.map((f) => (
              <span
                key={f}
                className="text-[10px] font-medium uppercase tracking-wide text-[#5C6E89] bg-[#F0EDE4] border border-[#DCDBD3] px-1.5 py-0.5 rounded"
              >
                {FORMAT_LABELS[f] ?? f}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <span className="mt-4 pt-3 border-t border-[#F0EDE4] inline-flex items-center gap-1 text-xs font-medium text-[#C26A4A] group-hover:gap-2 transition-all">
          View Book <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </a>
  );
}
