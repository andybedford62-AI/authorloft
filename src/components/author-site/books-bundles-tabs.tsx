"use client";

import { useState } from "react";
import { Library, Package } from "lucide-react";
import { BooksClient } from "@/app/(author-site)/[domain]/books/books-client";
import { BundlesGrid, type BundleForGrid } from "./bundles-grid";

interface BooksBundlesTabsProps {
  books: React.ComponentProps<typeof BooksClient>["books"];
  series: React.ComponentProps<typeof BooksClient>["series"];
  genres: React.ComponentProps<typeof BooksClient>["genres"];
  authorName: string;
  authorSlug: string;
  accentColor: string;
  layout?: string;
  bundles: BundleForGrid[];
  showBundlesTab: boolean;
  initialTab?: "books" | "bundles";
}

// Books and Bundles share one tab switcher (mirrors the same pattern already
// used on the admin dashboard and the AuthorLoft Bookstore) so the site nav
// only needs one entry instead of two. Courses is deliberately NOT part of
// this group -- a course-only creator may turn Books off entirely and still
// needs Courses reachable on its own, so it keeps its own top-level nav link
// and page. Bundles tab only renders at all when there's something to show
// in it; otherwise this just renders Books plainly, identical to before.
export function BooksBundlesTabs({
  books, series, genres, authorName, authorSlug, accentColor, layout,
  bundles, showBundlesTab, initialTab = "books",
}: BooksBundlesTabsProps) {
  const [active, setActive] = useState<"books" | "bundles">(initialTab);

  if (!showBundlesTab) {
    return (
      <BooksClient
        books={books}
        series={series}
        genres={genres}
        authorName={authorName}
        authorSlug={authorSlug}
        accentColor={accentColor}
        layout={layout}
        hideHeader
      />
    );
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActive("books")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors"
          style={
            active === "books"
              ? { backgroundColor: accentColor, borderColor: accentColor, color: "#fff" }
              : { borderColor: "#e5e7eb", color: "#6b7280" }
          }
        >
          <Library className="h-4 w-4" /> Books ({books.length})
        </button>
        <button
          type="button"
          onClick={() => setActive("bundles")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors"
          style={
            active === "bundles"
              ? { backgroundColor: accentColor, borderColor: accentColor, color: "#fff" }
              : { borderColor: "#e5e7eb", color: "#6b7280" }
          }
        >
          <Package className="h-4 w-4" /> Bundles ({bundles.length})
        </button>
      </div>

      {active === "books" ? (
        <BooksClient
          books={books}
          series={series}
          genres={genres}
          authorName={authorName}
          authorSlug={authorSlug}
          accentColor={accentColor}
          layout={layout}
          hideHeader
        />
      ) : (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <BundlesGrid bundles={bundles} />
        </section>
      )}
    </div>
  );
}
