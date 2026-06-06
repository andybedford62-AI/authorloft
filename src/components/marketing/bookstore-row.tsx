import type { ReactNode } from "react";
import { BookstoreBookCard, type BookstoreBook } from "@/components/marketing/bookstore-book-card";

/**
 * Horizontal, swipeable row of book cards (New / Trending sections).
 * Renders nothing when empty so sparse launches stay clean.
 */
export function BookstoreRow({
  title,
  icon,
  books,
}: {
  title: string;
  icon: ReactNode;
  books: BookstoreBook[];
}) {
  if (books.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="flex items-center gap-2 font-serif text-2xl text-[#1B2B47] mb-4">
        {icon}
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x scroll-smooth">
        {books.map((b) => (
          <div key={b.id} className="w-40 sm:w-44 shrink-0 snap-start">
            <BookstoreBookCard book={b} />
          </div>
        ))}
      </div>
    </section>
  );
}
