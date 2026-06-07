import { Sparkles } from "lucide-react";
import { BookstoreBookCard, type BookstoreBook } from "./bookstore-book-card";

interface BookstoreFeaturedRowProps {
  books: BookstoreBook[];
}

export function BookstoreFeaturedRow({ books }: BookstoreFeaturedRowProps) {
  if (books.length === 0) return null;

  const featuredBooks = books.filter((b) => b.featured).slice(0, 6);

  if (featuredBooks.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Header with accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-[#C26A4A]" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#1B2B47] font-normal">Featured Authors</h2>
            <p className="text-xs text-[#9b8e7e] mt-0.5">Discover premium authors and their bestsellers</p>
          </div>
        </div>
      </div>

      {/* Featured books grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {featuredBooks.map((book) => (
          <BookstoreBookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
