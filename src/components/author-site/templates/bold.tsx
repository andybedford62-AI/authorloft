// Bold Template — dramatic dark hero with oversized book covers dominating above the fold.
// Designed for thriller, fantasy, and genre fiction authors.

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeTemplateProps } from "./types";

export function BoldTemplate({ author, books, series }: HomeTemplateProps) {
  const accentColor = author.accentColor;
  const featuredBooks = books.filter((b) => b.isFeatured);
  const heroBooks = (featuredBooks.length > 0 ? featuredBooks : books).slice(0, 4);
  const displayBooks = books.slice(0, 6);

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── Dark Hero ───────────────────────────────────────────────────── */}
      {author.heroImageUrl ? (
        /* ── Full-bleed photo hero ── */
        <section className="relative min-h-[85vh] flex items-end overflow-hidden">
          <Image
            src={author.heroImageUrl}
            alt={author.displayName || author.name}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 pb-14 sm:pb-20 space-y-4">
            <p className="animate-fade-up text-xs uppercase tracking-[0.25em] font-semibold" style={{ color: accentColor }}>
              Author
            </p>
            <h1 className="animate-fade-up animate-delay-100 text-4xl sm:text-6xl md:text-7xl font-extrabold leading-none tracking-tight text-white drop-shadow-lg">
              {author.displayName || author.name}
            </h1>
            {author.tagline && (
              <p className="animate-fade-up animate-delay-200 text-lg sm:text-xl text-white/80 font-light max-w-xl">
                {author.tagline}
              </p>
            )}
            {(author.heroSubtitle || author.shortBio) && (
              <p className="animate-fade-up animate-delay-200 text-white/60 leading-relaxed max-w-lg text-sm sm:text-base">
                {author.heroSubtitle || author.shortBio}
              </p>
            )}
            <div className="animate-fade-up animate-delay-300 flex flex-wrap gap-3 pt-2">
              <Link href="/books">
                <Button size="lg" className="text-gray-900 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300" style={{ backgroundColor: accentColor }}>
                  Explore Books <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  About the Author
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* ── Dark accent hero (fallback) ── */
        <section className="relative overflow-hidden bg-gray-950 text-white">
          <div className="absolute inset-0 opacity-25" style={{ background: `radial-gradient(ellipse at 70% 40%, ${accentColor}, transparent 65%)` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950/80 pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10" style={{ backgroundColor: accentColor }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-10" style={{ backgroundColor: accentColor }} />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 space-y-5 z-10">
              <p className="animate-fade-up text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: accentColor }}>Author</p>
              <h1 className="animate-fade-up animate-delay-100 text-4xl sm:text-6xl font-extrabold leading-none tracking-tight">
                {author.displayName || author.name}
              </h1>
              {author.tagline && (
                <p className="animate-fade-up animate-delay-200 text-lg text-gray-300 font-light">{author.tagline}</p>
              )}
              {author.heroSubtitle ? (
                <p className="animate-fade-up animate-delay-200 text-gray-400 leading-relaxed max-w-md text-sm sm:text-base">{author.heroSubtitle}</p>
              ) : author.shortBio ? (
                <div className="animate-fade-up animate-delay-200 rich-content max-w-md" dangerouslySetInnerHTML={{ __html: author.shortBio }} />
              ) : null}
              <div className="animate-fade-up animate-delay-300 flex flex-wrap gap-3 pt-2">
                <Link href="/books">
                  <Button size="lg" className="text-gray-900 font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300" style={{ backgroundColor: accentColor, borderColor: accentColor }}>
                    Explore Books <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">About the Author</Button>
                </Link>
              </div>
            </div>

            {heroBooks.length > 0 && (
              <div className="flex-shrink-0 flex gap-3 sm:gap-4 items-end z-10">
                {heroBooks.map((book, i) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    title={book.title}
                    className={`animate-fade-up group relative rounded-lg overflow-hidden shadow-2xl block transition-transform duration-300 hover:scale-105 hover:-translate-y-1 ${
                      i === 0 ? "w-32 h-48 sm:w-40 sm:h-60" :
                      i === 1 ? "w-28 h-40 sm:w-32 sm:h-48" :
                      "w-20 h-32 sm:w-24 sm:h-36 hidden sm:block"
                    }`}
                    style={{ marginBottom: i === 1 ? "0" : i === 0 ? "0" : "8px", animationDelay: `${(i + 2) * 100}ms` }}
                  >
                    {book.coverImageUrl ? (
                      <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <BookOpen className="h-8 w-8 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
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
