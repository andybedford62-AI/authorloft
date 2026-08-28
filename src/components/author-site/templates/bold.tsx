// Bold Template — "Spotlight" layout.
// Hero → Author Strip → ONE Featured Book spotlight → remaining books grid → Series → Newsletter → Contact
// Designed for authors who want one book to lead everything.

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, BookOpen, ShoppingCart, Mail } from "lucide-react";
import { sanitize } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/author-site/hero-banner";
import { NewsletterInlineForm } from "@/components/author-site/newsletter-inline-form";
import { accentAsTextOn } from "@/lib/color-contrast";
import type { HomeTemplateProps } from "./types";

export function BoldTemplate({ author, books, series }: HomeTemplateProps) {
  const accentColor  = author.accentColor;
  const authorName   = author.displayName || author.name;
  const firstName    = authorName.split(" ")[0];
  const salesEnabled = author.plan?.salesEnabled ?? false;
  // This template alternates dark and white sections, so accent-as-text needs a
  // contrast floor against each. gray-900 is the reference for the dark bands
  // (the harder of the two darks — gray-950 only has more contrast).
  const accentOnDark  = accentAsTextOn(accentColor, "#111827");
  const accentOnLight = accentAsTextOn(accentColor, "#ffffff");

  // Spotlight book: resolve through books[] so we get the full BookForTemplate type
  const spotlightBook: typeof books[0] | null = author.heroFeaturedBook
    ? (books.find((b) => b.slug === author.heroFeaturedBook!.slug) ?? books.find((b) => b.isFeatured) ?? books[0] ?? null)
    : (books.find((b) => b.isFeatured) ?? books[0] ?? null);

  // Remaining books — exclude the spotlight book from the grid
  const remainingBooks = books.filter((b) => b.id !== spotlightBook?.id).slice(0, 4);

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── 1. Hero Banner ───────────────────────────────────────────────── */}
      {author.showHeroBanner !== false && (
        <HeroBanner
          author={author}
          featuredBook={spotlightBook}
        />
      )}

      {/* ── 2. Author Strip ──────────────────────────────────────────────── */}
      <section className="bg-gray-900 text-white py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
          {author.profileImageUrl && (
            <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-gray-700 relative">
              <Image src={author.profileImageUrl} alt={authorName} fill className="object-cover" />
            </div>
          )}
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest">About the Author</p>
            <div
              className="text-gray-300 leading-relaxed text-sm rich-content rich-content-invert max-w-2xl"
              dangerouslySetInnerHTML={{ __html: sanitize(author.shortBio || "<p>More about this author coming soon.</p>") }}
            />
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1">
              <Link href="/about" className="inline-flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: accentOnDark }}>
                Full biography <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: accentOnDark }}>
                <Mail className="h-3.5 w-3.5" /> Email {firstName}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Featured Book Spotlight ────────────────────────────────────── */}
      {spotlightBook && (
        <section className="py-20 bg-gray-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">

            {/* Section label */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-10 text-center" style={{ color: accentOnDark }}>
              Featured Release
            </p>

            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">

              {/* Book cover — large with shadow/glow */}
              <div className="flex-shrink-0 w-56 md:w-72">
                <Link href={`/books/${spotlightBook.slug}`} className="block group">
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ aspectRatio: "2/3", boxShadow: `0 25px 60px ${accentColor}40` }}
                  >
                    {spotlightBook.coverImageUrl ? (
                      <Image
                        src={spotlightBook.coverImageUrl}
                        alt={spotlightBook.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <BookOpen className="h-16 w-16 text-gray-600" />
                      </div>
                    )}
                  </div>
                </Link>
              </div>

              {/* Book details */}
              <div className="flex-1 space-y-5 text-center md:text-left">

                {/* Series label */}
                {spotlightBook.series && (
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentOnDark }}>
                    {spotlightBook.series.name}
                  </p>
                )}

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white author-font-heading leading-tight">
                  {spotlightBook.title}
                </h2>

                {/* Subtitle */}
                {spotlightBook.subtitle && (
                  <p className="text-lg text-gray-400 font-light">{spotlightBook.subtitle}</p>
                )}

                {/* Description excerpt */}
                {spotlightBook.shortDescription && (
                  <div
                    className="text-gray-400 leading-relaxed max-w-lg mx-auto md:mx-0 line-clamp-4 rich-content rich-content-invert"
                    dangerouslySetInnerHTML={{ __html: sanitize(spotlightBook.shortDescription) }}
                  />
                )}

                {/* CTAs */}
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start pt-2">
                  <Link href={`/books/${spotlightBook.slug}`}>
                    <Button
                      size="lg"
                      className="font-semibold text-white hover:opacity-90"
                      style={{ backgroundColor: accentColor }}
                    >
                      View Book
                    </Button>
                  </Link>
                  {salesEnabled && spotlightBook.priceCents > 0 && (
                    <Link href={`/books/${spotlightBook.slug}`}>
                      <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                        <ShoppingCart className="h-4 w-4 mr-1.5" />
                        Buy Now
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. More Books Grid ────────────────────────────────────────────── */}
      {remainingBooks.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight author-font-heading">
                More Books
              </h2>
              <Link
                href="/books"
                className="text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: accentOnLight }}
              >
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-8">
              {remainingBooks.map((book) => (
                <Link key={book.id} href={`/books/${book.slug}`} className="group space-y-2.5">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 relative shadow-md group-hover:shadow-xl transition-shadow duration-300">
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
                    {(book.caption || book.isPreOrder) && (
                      <span
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-white shadow"
                        style={{ backgroundColor: accentColor }}
                      >
                        {book.caption || "Coming Soon"}
                      </span>
                    )}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                  <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:underline">
                    {book.title}
                  </p>
                  {book.series && (
                    <p className="text-xs" style={{ color: accentOnLight }}>{book.series.name}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Series ────────────────────────────────────────────────────── */}
      {series.length > 0 && (
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

      {/* ── 6. Newsletter ────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-900 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: accentOnDark }}>
                {firstName}&rsquo;s Newsletter
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white author-font-heading leading-tight">
                Letters from {firstName}
              </h2>
              <p className="text-gray-400 mt-2 leading-relaxed">
                New releases, behind-the-scenes notes, and reading recommendations —
                straight to your inbox.
              </p>
            </div>
            <NewsletterInlineForm
              authorId={author.id}
              accentColor={accentColor}
              tone="dark"
            />
          </div>
        </div>
      </section>

      {/* ── 7. Contact CTA ───────────────────────────────────────────────── */}
      <section className="py-10 bg-gray-950 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Get in Touch</p>
            <p className="text-gray-500 text-sm mt-0.5">Inquiries, collaborations, and media welcome.</p>
          </div>
          <Link href="/contact">
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Contact {authorName}
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
