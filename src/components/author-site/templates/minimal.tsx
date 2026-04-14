// Minimal Template (v3)
// Structure: full-width accent banner → author bio → books grid → series → newsletter → contact CTA

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, BookOpen, BookMarked, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeTemplateProps } from "./types";

export function MinimalTemplate({ author, books, series }: HomeTemplateProps) {
  const accentColor = author.accentColor;
  const featuredBooks = books.filter((b) => b.isFeatured);
  const displayBooks = featuredBooks.length > 0 ? featuredBooks.slice(0, 8) : books.slice(0, 8);

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── 1. Top Banner ───────────────────────────────────────────────── */}
      <section className="w-full py-14 px-4" style={{ backgroundColor: accentColor }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">

          {/* Left: author identity */}
          <div className="flex-1 text-white space-y-3">
            <div className="flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-white/60" />
              <span className="text-white/60 text-xs font-semibold uppercase tracking-[0.2em]">
                Author
              </span>
            </div>
            <h1
              className="text-3xl sm:text-5xl font-bold text-white leading-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {author.displayName || author.name}
            </h1>
            {author.tagline && (
              <p className="text-white/75 text-base sm:text-lg max-w-md">
                {author.tagline}
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/books">
                <Button
                  size="sm"
                  className="bg-white font-semibold hover:bg-white/90 shadow"
                  style={{ color: accentColor }}
                >
                  Browse Books <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/15 border border-white/30"
                >
                  About Me
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: profile photo */}
          {author.profileImageUrl && (
            <div className="flex-shrink-0">
              <div
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden relative shadow-xl"
                style={{ outline: "3px solid rgba(255,255,255,0.3)", outlineOffset: "4px" }}
              >
                <Image
                  src={author.profileImageUrl}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. Author Bio ───────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row items-start gap-8 max-w-3xl">

            {/* Accent rule + bio */}
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: accentColor }} />
                <h2
                  className="text-xl font-bold text-gray-900"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  About {author.displayName || author.name}
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {author.shortBio || "Author bio coming soon."}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                style={{ color: accentColor }}
              >
                Full biography <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Books ────────────────────────────────────────────────────── */}
      <section className="py-16" style={{ backgroundColor: `${accentColor}08` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: accentColor }} />
              <h2
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {featuredBooks.length > 0 ? "Featured Books" : "Books"}
              </h2>
            </div>
            {books.length > 8 && (
              <Link
                href="/books"
                className="text-sm font-semibold flex items-center gap-1 transition-opacity hover:opacity-75"
                style={{ color: accentColor }}
              >
                All {books.length} books <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
            {displayBooks.map((book) => (
              <Link key={book.id} href={`/books/${book.slug}`} className="group space-y-3">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-200 relative shadow group-hover:shadow-lg transition-shadow duration-300">
                  {book.coverImageUrl ? (
                    <Image
                      src={book.coverImageUrl}
                      alt={book.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-gray-300" />
                    </div>
                  )}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:underline">
                    {book.title}
                  </p>
                  {book.series && (
                    <p className="text-xs mt-0.5 font-medium" style={{ color: accentColor }}>
                      {book.series.name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Series ───────────────────────────────────────────────────── */}
      {series.length > 0 && (
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: accentColor }} />
              <h2
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Series
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {series.map((s) => (
                <Link
                  key={s.id}
                  href={`/series/${s.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white p-5 hover:shadow-md transition-all duration-200"
                  style={{ borderLeftWidth: "4px", borderLeftColor: accentColor }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900 group-hover:underline leading-snug">
                        {s.name}
                      </p>
                      {s.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {s.description}
                        </p>
                      )}
                      <p className="text-xs font-medium" style={{ color: accentColor }}>
                        {s.books.length} book{s.books.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-300 group-hover:text-[var(--accent)] transition-colors" />
                  </div>

                  {/* Book cover thumbnails */}
                  {s.books.length > 0 && (
                    <div className="flex gap-1.5 mt-4">
                      {s.books.slice(0, 4).map((b) => (
                        <div
                          key={b.id}
                          className="w-9 h-12 rounded overflow-hidden bg-gray-100 relative flex-shrink-0 shadow-sm"
                        >
                          {b.coverImageUrl ? (
                            <Image src={b.coverImageUrl} alt={b.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full opacity-30" style={{ backgroundColor: accentColor }} />
                          )}
                        </div>
                      ))}
                      {s.books.length > 4 && (
                        <div
                          className="w-9 h-12 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: accentColor }}
                        >
                          +{s.books.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Contact CTA ──────────────────────────────────────────────── */}
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-gray-900 font-semibold">Get in Touch</p>
            <p className="text-gray-500 text-sm mt-0.5">Inquiries, collaborations, and media welcome.</p>
          </div>
          <Link href="/contact">
            <Button
              className="text-white hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Contact {author.displayName || author.name}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
