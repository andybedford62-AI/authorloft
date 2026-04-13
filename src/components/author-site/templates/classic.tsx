// Classic Template — AuthorLoft homepage layout.
// Hero → About → Book Carousel → Series → Newsletter → Contact CTA

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, BookOpen, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCarousel } from "@/components/author-site/book-carousel";
import { NewsletterForm } from "@/components/author-site/newsletter-form";
import type { HomeTemplateProps } from "./types";

// ── Gradient palette for series cards (cycles by index) ──────────────────────
const SERIES_GRADIENTS = [
  ["#4f46e5", "#7c3aed"],   // indigo → violet
  ["#0891b2", "#0d9488"],   // cyan → teal
  ["#dc2626", "#db2777"],   // red → pink
  ["#d97706", "#ca8a04"],   // amber → yellow
  ["#16a34a", "#0d9488"],   // green → teal
  ["#7c3aed", "#db2777"],   // violet → pink
];

export function ClassicTemplate({ author, books, series, genreTree }: HomeTemplateProps) {
  const accentColor  = author.accentColor;
  const authorName   = author.displayName || author.name;
  const salesEnabled = author.plan?.salesEnabled ?? false;
  const flatGenres   = genreTree.flatMap((g) => [g, ...g.children]);

  // Hero shows only the single book marked isFeatured in the admin
  const heroBook = books.find((b) => b.isFeatured) ?? null;

  // Credential pills — filter out blanks, only render if at least one has text
  const credentialPills = (author.credentials ?? []).filter((c) => c?.trim());

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      {author.showHeroBanner !== false && (
        <section className="w-full py-16 px-4" style={{ backgroundColor: accentColor }}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">

            {/* Text */}
            <div className="flex-1 text-white space-y-4 order-2 md:order-1">
              <span className="text-sm font-medium uppercase tracking-widest opacity-70">
                Available now
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
                {author.heroTitle || `Books by ${authorName}`}
              </h1>
              {author.heroSubtitle && (
                <p className="text-white/80 text-lg max-w-md">{author.heroSubtitle}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={heroBook ? `/books/${heroBook.slug}` : "/books"}>
                  <Button
                    size="lg"
                    className="bg-white hover:bg-gray-100 font-semibold shadow-lg"
                    style={{ color: accentColor }}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Shop Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Single featured book cover */}
            {heroBook && (
              <div className="flex-shrink-0 order-1 md:order-2">
                <Link
                  href={`/books/${heroBook.slug}`}
                  title={heroBook.title}
                  className="group block relative rounded-xl overflow-hidden shadow-2xl ring-2 ring-white/30
                             transition-transform duration-200 hover:scale-105"
                  style={{ width: 160, height: 240 }}
                >
                  {heroBook.coverImageUrl ? (
                    <Image
                      src={heroBook.coverImageUrl}
                      alt={heroBook.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                </Link>
                {heroBook.caption && (
                  <p className="mt-2 text-center text-xs font-semibold text-white/70 uppercase tracking-wider">
                    {heroBook.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Author Bio ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col md:flex-row gap-10 items-start">

          {/* Text + credentials */}
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
                About the Author
              </p>
              <h2 className="text-2xl font-bold text-gray-900">{authorName}</h2>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {author.shortBio || "Author bio coming soon."}
            </p>

            {/* Credential pills — only rendered if at least one has text */}
            {credentialPills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {credentialPills.map((cred) => (
                  <span
                    key={cred}
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ borderColor: accentColor + "55", color: accentColor, backgroundColor: accentColor + "10" }}
                  >
                    {cred}
                  </span>
                ))}
              </div>
            )}

            <Link href="/about">
              <Button variant="outline" className="mt-1">Meet the Author</Button>
            </Link>
          </div>

          {/* Profile photo */}
          <div className="flex-shrink-0">
            <div
              className="w-56 h-56 rounded-2xl overflow-hidden bg-gray-100 shadow-lg relative ring-4"
              style={{ ringColor: accentColor + "40" }}
            >
              {author.profileImageUrl ? (
                <Image src={author.profileImageUrl} alt={authorName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-300">
                  {author.name[0]}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Book Carousel ───────────────────────────────────────────────────── */}
      {books.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Books</h2>
            <Link
              href="/books"
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: accentColor }}
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <BookCarousel
            books={books}
            accentColor={accentColor}
            salesEnabled={salesEnabled}
          />
        </section>
      )}

      {/* ── Browse by Series ────────────────────────────────────────────────── */}
      {series.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Explore</p>
              <h2 className="text-2xl font-bold text-gray-900">Browse by Series</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {series.map((s, i) => {
                const [colorA, colorB] = SERIES_GRADIENTS[i % SERIES_GRADIENTS.length];
                const coverBooks = s.books.filter((b) => b.coverImageUrl).slice(0, 3);

                return (
                  <Link
                    key={s.id}
                    href={`/series/${s.slug}`}
                    className="group rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
                  >
                    {/* Gradient header with mini covers */}
                    <div
                      className="relative h-28 flex items-center justify-center gap-2 px-5"
                      style={{ background: `linear-gradient(135deg, ${colorA}, ${colorB})` }}
                    >
                      {/* Book count badge */}
                      <div className="absolute top-3 right-3 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {s.books.length} {s.books.length === 1 ? "book" : "books"}
                      </div>

                      {coverBooks.length > 0 ? (
                        /* Mini overlapping book covers */
                        <div className="flex items-end gap-1">
                          {coverBooks.map((b, ci) => (
                            <div
                              key={b.id}
                              className="relative rounded shadow-lg overflow-hidden bg-white/20 flex-shrink-0"
                              style={{
                                width: ci === 1 ? 44 : 36,
                                height: ci === 1 ? 60 : 50,
                                zIndex: ci === 1 ? 10 : 5,
                              }}
                            >
                              <Image src={b.coverImageUrl!} alt={b.title} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Fallback: series initial */
                        <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                          {s.name[0]}
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-5 flex-1 flex flex-col gap-2">
                      <h3 className="font-bold text-gray-900 group-hover:text-[var(--accent)] transition-colors leading-snug">
                        {s.name}
                      </h3>
                      {s.description && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
                          {s.description}
                        </p>
                      )}
                      <span
                        className="flex items-center gap-1 text-sm font-semibold mt-1 transition-colors"
                        style={{ color: colorA }}
                      >
                        Explore Series <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gray-50 rounded-2xl p-8 sm:p-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay in the Loop</h2>
            <p className="text-gray-500 mb-6">
              Sign up for news about new releases, special offers, and author updates. No spam — ever.
            </p>
            <NewsletterForm
              authorId={author.id}
              authorSlug={author.slug}
              accentColor={accentColor}
              genres={flatGenres.map((g) => ({ id: g.id, name: g.name }))}
            />
          </div>
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────────────────────────────────────── */}
      <section className="py-12" style={{ backgroundColor: accentColor + "15" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Get in Touch</h2>
            <p className="text-gray-500 text-sm mt-1">Inquiries, collaborations, and media welcome.</p>
          </div>
          <Link href="/contact">
            <Button size="lg">Contact {authorName}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
