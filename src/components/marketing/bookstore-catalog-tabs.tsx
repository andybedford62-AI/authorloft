"use client";

import { useState } from "react";
import { Library, GraduationCap, Music2 } from "lucide-react";
import { BookstoreGrid } from "@/components/marketing/bookstore-grid";
import { BookstoreCourseGrid } from "@/components/marketing/bookstore-course-grid";
import { BookstoreMusicGrid } from "@/components/marketing/bookstore-music-grid";
import { type BookstoreBook } from "@/components/marketing/bookstore-book-card";
import { type BookstoreCourse } from "@/components/marketing/bookstore-course-card";
import { type BookstoreMusic } from "@/components/marketing/bookstore-music-card";

// Books, Courses and Music each keep their own grid/filter UI (different facets —
// genre/format/price for books, category for courses, none for music) but now
// live under one shared type tab instead of always-visible sections.
export function BookstoreCatalogTabs({
  books,
  allGenres,
  courses,
  allCategories,
  music,
}: {
  books: BookstoreBook[];
  allGenres: string[];
  courses: BookstoreCourse[];
  allCategories: string[];
  music: BookstoreMusic[];
}) {
  const [active, setActive] = useState<"books" | "courses" | "music">("books");

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
        <button
          type="button"
          onClick={() => setActive("music")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-vault-display text-lg transition-colors ${
            active === "music"
              ? "bg-vault-gold text-vault-bg"
              : "bg-vault-bg text-vault-mute border border-vault-ink/15 hover:border-vault-gold"
          }`}
        >
          <Music2 className="h-4 w-4" /> Music ({music.length})
        </button>
      </div>

      {active === "books" ? (
        <BookstoreGrid books={books} allGenres={allGenres} />
      ) : active === "courses" ? (
        <BookstoreCourseGrid courses={courses} allCategories={allCategories} />
      ) : (
        <BookstoreMusicGrid music={music} />
      )}
    </div>
  );
}
