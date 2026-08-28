"use client";

import { useState } from "react";
import { Library, GraduationCap } from "lucide-react";
import { BookstoreGrid } from "@/components/marketing/bookstore-grid";
import { BookstoreCourseGrid } from "@/components/marketing/bookstore-course-grid";
import { type BookstoreBook } from "@/components/marketing/bookstore-book-card";
import { type BookstoreCourse } from "@/components/marketing/bookstore-course-card";

// Books and Courses each keep their own grid/filter UI (different facets —
// genre/format/price for books, category only for courses) but now live
// under one shared type tab instead of two always-visible sections.
export function BookstoreCatalogTabs({
  books,
  allGenres,
  courses,
  allCategories,
}: {
  books: BookstoreBook[];
  allGenres: string[];
  courses: BookstoreCourse[];
  allCategories: string[];
}) {
  const [active, setActive] = useState<"books" | "courses">("books");

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => setActive("books")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-vault-display text-lg transition-colors ${
            active === "books"
              ? "bg-vault-gold text-vault-bg"
              : "bg-vault-bg text-vault-mute border border-vault-ink/15 hover:border-vault-gold"
          }`}
        >
          <Library className="h-4 w-4" /> Books ({books.length})
        </button>
        <button
          type="button"
          onClick={() => setActive("courses")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-vault-display text-lg transition-colors ${
            active === "courses"
              ? "bg-vault-gold text-vault-bg"
              : "bg-vault-bg text-vault-mute border border-vault-ink/15 hover:border-vault-gold"
          }`}
        >
          <GraduationCap className="h-4 w-4" /> Courses ({courses.length})
        </button>
      </div>

      {active === "books" ? (
        <BookstoreGrid books={books} allGenres={allGenres} />
      ) : (
        <BookstoreCourseGrid courses={courses} allCategories={allCategories} />
      )}
    </div>
  );
}
