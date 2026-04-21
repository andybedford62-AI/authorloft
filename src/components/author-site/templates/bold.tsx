// Bold Template — dramatic dark hero with oversized book covers dominating above the fold.
// Designed for thriller, fantasy, and genre fiction authors.

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/author-site/hero-banner";
import type { HomeTemplateProps } from "./types";

export function BoldTemplate({ author, books, series }: HomeTemplateProps) {
  const accentColor = author.accentColor;
  const featuredBooks = books.filter((b) => b.isFeatured);
  const heroBooks = (featuredBooks.length > 0 ? featuredBooks : books).slice(0, 4);
  const displayBooks = books.slice(0, 6);

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      {author.showHeroBanner !== false && (
        <HeroBanner author={author} featuredBook={heroBooks[0] ?? null} />
      )}

      {/* ── Author Strip ─────────────────────────────────────────────────── */}
      <section className="bg-gray-900 text-white py-10 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          {author.profileImageUrl && (
            <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700 relative">
              <Image src={author.profileImageUrl} alt={author.name} fill className="object-cover" />
            </div>
          )}
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-sm text-gray-400 uppercase tracking-widest">About the Author</p>
            <div
              className="rich-content max-w-2xl"
              dangerouslySetInnerHTML={{ __html: author.shortBio || "<p>More about this author coming soon.</p>" }}
            />
            <Link href="/about" className="inline-flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: accentColor }}>
              Full biography <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Books Grid ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight font-heading">
              Books
            </h2>
            {books.length > 6 && (
              <Link href="/books" className="text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: accentColor }}>
                All {books.length} books <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {displayBooks.map((book) => (
              <Link key={book.id} href={`/books/${book.slug}`} className="group space-y-3">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 relative shadow-md group-hover:shadow-xl transition-shadow duration-300">
                  {book.coverImageUrl ? (
                    <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  {/* Accent colour overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundColor: accentColor }} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:underline">
                    {book.title}
                  </p>
                  {book.series && (
                    <p className="text-xs mt-0.5" style={{ color: accentColor }}>{book.series.name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Series ──────────────────────────────────────────────────────── */}
      {series.filter((s) => s.books.length > 0).length > 0 && (
        <section className="py-14 bg-gray-950 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-extrabold mb-6 tracking-tight">Series</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {series.map((s) => (
                <Link
                  key={s.id}
                  href={`/series/${s.slug}`}
                  className="group flex items-center justify-between px-5 py-4 rounded-xl border border-gray-800 hover:border-[var(--accent)] bg-gray-900 hover:bg-gray-800 transition-all duration-200"
                >
                  <div>
                    <p className="font-semibold text-white group-hover:text-[var(--accent)] transition-colors">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.books.length} book{s.books.length !== 1 ? "s" : ""}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-[var(--accent)] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact CTA ─────────────────────────────────────────────────── */}
      <section className="py-10 bg-gray-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Get in Touch</p>
            <p className="text-gray-500 text-sm mt-0.5">Inquiries, collaborations, and media welcome.</p>
          </div>
          <Link href="/contact">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Contact {author.displayName || author.name}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
