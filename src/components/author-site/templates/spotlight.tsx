// Spotlight Template — AuthorLoft homepage layout. Premium.
// Hero → Meet the Author → Featured Release (full description) → More Books → Genre Breakdown → Newsletter → Contact CTA

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, BookOpen, GraduationCap, ListMusic, ShoppingCart, Mail } from "lucide-react";
import { sanitize } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { HeroBanner } from "@/components/author-site/hero-banner";
import { NewsletterInlineForm } from "@/components/author-site/newsletter-inline-form";
import { accentAsTextOn, readableTextOn } from "@/lib/color-contrast";
import { getTheme } from "@/lib/themes";
import type { HomeTemplateProps } from "./types";

export function SpotlightTemplate({ author, books, courses, music, genreTree }: HomeTemplateProps) {
  const accentColor  = author.accentColor;
  const authorName   = author.displayName || author.name;
  const firstName    = authorName.split(" ")[0];
  const salesEnabled = author.plan?.salesEnabled ?? false;

  // Every section below (not just the hero) reads its surface from the
  // author's chosen Colour Theme / genre palette, so a dark, moody palette
  // reads as one immersive page rather than a colour band at the top with
  // plain white sections underneath — the whole point of "Story-First".
  const pageBg     = getTheme(author.siteTheme).preview.bg;
  const textColor  = readableTextOn(pageBg);
  const isDarkPage = textColor === "#fff";
  const bodyText    = isDarkPage ? "rgba(255,255,255,0.68)" : "rgba(17,17,17,0.62)";
  const subtleText  = isDarkPage ? "rgba(255,255,255,0.45)" : "rgba(17,17,17,0.45)";
  const hairline     = isDarkPage ? "rgba(255,255,255,0.12)" : "rgba(17,17,17,0.08)";
  const placeholderBg = isDarkPage ? "rgba(255,255,255,0.06)" : "rgba(17,17,17,0.04)";
  const tintBg = (ratio: number) => `color-mix(in srgb, ${accentColor} ${ratio}%, ${pageBg})`;
  const accentText = accentAsTextOn(accentColor, pageBg);

  const credentialPills = (author.credentials ?? []).filter((c) => c?.trim());

  // Same book/course/music item drives both the hero and the Featured Release
  // spotlight below, so the two sections never disagree about what's "featured".
  const heroBook = author.heroFeaturedBook
    ? (books.find((b) => b.slug === author.heroFeaturedBook!.slug) ?? books.find((b) => b.isFeatured) ?? books[0] ?? null)
    : (books.find((b) => b.isFeatured) ?? books[0] ?? null);
  const heroCourse = courses.find((c) => c.isFeatured) ?? courses[0] ?? null;
  const heroMusic  = music.find((m) => m.isFeatured) ?? music[0] ?? null;
  const spotlightItem =
    author.heroFocus === "COURSES" ? heroCourse :
    author.heroFocus === "MUSIC"   ? heroMusic  :
    heroBook;

  const remainingBooks = books.filter((b) => b.id !== heroBook?.id).slice(0, 4);

  // Genre breakdown — counts books tagged with each top-level genre or any of
  // its children. Computed from data already fetched for the homepage, so this
  // needs no extra query.
  const genreCounts = genreTree
    .map((g) => {
      const childIds = new Set(g.children.map((c) => c.id));
      const count = books.filter((b) =>
        b.genres.some((bg) => bg.genre.id === g.id || childIds.has(bg.genre.id))
      ).length;
      return { id: g.id, name: g.name, count };
    })
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count);

  const heroBookGenreLabel = heroBook?.genres[0]?.genre.name ?? heroBook?.series?.name ?? null;

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      {/* Always the "portrait" layout (title + featured item, no author photo)
          regardless of the account's Branding -> Hero setting — Spotlight leads
          with the content, and introduces the author separately below. */}
      {author.showHeroBanner !== false && (
        <HeroBanner author={author} focus={author.heroFocus} featuredItem={spotlightItem} layoutOverride="portrait" coverSize="lg" />
      )}

      {/* ── Meet the Author ──────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 md:py-20" style={{ backgroundColor: tintBg(10) }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-center">

            {/* Photo — leads on the left, mirroring the hero's cover-on-the-right
                composition so the two sections read as a deliberate pair. */}
            <div className="w-full max-w-xs md:w-80 md:max-w-none flex-shrink-0">
              <div
                className="w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-lg relative ring-4"
                style={{ backgroundColor: placeholderBg, "--tw-ring-color": accentColor + "40" } as React.CSSProperties}
              >
                {author.profileImageUrl ? (
                  <Image src={author.profileImageUrl} alt={authorName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold" style={{ color: subtleText }}>
                    {author.name[0]}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentText }}>
                  Meet the Author
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold author-font-heading tracking-tight" style={{ color: textColor }}>{authorName}</h2>
              </div>

              <div
                className="leading-relaxed rich-content"
                style={{ color: bodyText }}
                dangerouslySetInnerHTML={{ __html: sanitize(author.shortBio || "<p>Author bio coming soon.</p>") }}
              />

              {credentialPills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {credentialPills.map((cred) => (
                    <span
                      key={cred}
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{ borderColor: accentColor + "55", color: accentText, backgroundColor: accentColor + "10" }}
                    >
                      {cred}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <Link href="/about" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline" style={{ color: accentText }}>
                  Full biography <ChevronRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: accentText }}>
                  <Mail className="h-3.5 w-3.5" /> Email {firstName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Release — Books ─────────────────────────────────────────── */}
      {author.heroFocus === "BOOKS" && heroBook && (
        <section className="py-16 md:py-20" style={{ backgroundColor: pageBg, borderTop: `1px solid ${hairline}` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="flex-shrink-0 w-56 md:w-72">
                <Link href={`/books/${heroBook.slug}`} className="block group">
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ aspectRatio: "2/3", boxShadow: `0 25px 60px ${accentColor}30` }}
                  >
                    {heroBook.coverImageUrl ? (
                      <Image src={heroBook.coverImageUrl} alt={heroBook.title} fill className="object-cover" priority />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: placeholderBg }}>
                        <BookOpen className="h-16 w-16" style={{ color: subtleText }} />
                      </div>
                    )}
                  </div>
                </Link>
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentText }}>
                  Featured Release{heroBookGenreLabel ? ` · ${heroBookGenreLabel}` : ""}
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold author-font-heading leading-tight" style={{ color: textColor }}>
                  {heroBook.title}
                </h2>
                {heroBook.subtitle && (
                  <p className="text-lg font-light italic" style={{ color: subtleText }}>{heroBook.subtitle}</p>
                )}
                <div
                  className="leading-relaxed max-w-lg mx-auto md:mx-0 rich-content"
                  style={{ color: bodyText }}
                  dangerouslySetInnerHTML={{ __html: sanitize(heroBook.description || heroBook.shortDescription || "") }}
                />
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start pt-2">
                  {salesEnabled && heroBook.priceCents > 0 && (
                    <Link href={`/books/${heroBook.slug}`}>
                      <Button size="lg" className="font-semibold text-white hover:opacity-90" style={{ backgroundColor: accentColor }}>
                        <ShoppingCart className="h-4 w-4 mr-1.5" /> Buy Now
                      </Button>
                    </Link>
                  )}
                  <Link href={`/books/${heroBook.slug}`}>
                    <Button size="lg" variant="outline">View Book</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Release — Courses ───────────────────────────────────────── */}
      {author.heroFocus === "COURSES" && heroCourse && (
        <section className="py-16 md:py-20" style={{ backgroundColor: pageBg, borderTop: `1px solid ${hairline}` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="flex-shrink-0 w-full md:w-96">
                <Link href={`/courses/${heroCourse.slug}`} className="block group">
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] aspect-video"
                    style={{ boxShadow: `0 25px 60px ${accentColor}30` }}
                  >
                    {heroCourse.coverImageUrl ? (
                      <Image src={heroCourse.coverImageUrl} alt={heroCourse.title} fill className="object-cover" priority />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: placeholderBg }}>
                        <GraduationCap className="h-16 w-16" style={{ color: subtleText }} />
                      </div>
                    )}
                  </div>
                </Link>
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentText }}>Featured Course</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold author-font-heading leading-tight" style={{ color: textColor }}>{heroCourse.title}</h2>
                <div
                  className="leading-relaxed max-w-lg mx-auto md:mx-0 rich-content"
                  style={{ color: bodyText }}
                  dangerouslySetInnerHTML={{ __html: sanitize(heroCourse.description || "") }}
                />
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start pt-2">
                  <Link href={`/courses/${heroCourse.slug}`}>
                    <Button size="lg" className="font-semibold text-white hover:opacity-90" style={{ backgroundColor: accentColor }}>
                      {heroCourse.priceCents === 0 ? "Start Free" : "View Course"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Release — Music ──────────────────────────────────────────── */}
      {author.heroFocus === "MUSIC" && heroMusic && (
        <section className="py-16 md:py-20" style={{ backgroundColor: pageBg, borderTop: `1px solid ${hairline}` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
              <div className="flex-shrink-0 w-full md:w-96">
                <Link href={`/music/${heroMusic.slug}`} className="block group">
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] aspect-video"
                    style={{ boxShadow: `0 25px 60px ${accentColor}30` }}
                  >
                    {heroMusic.coverImageUrl ? (
                      <Image src={heroMusic.coverImageUrl} alt={heroMusic.title} fill className="object-cover" priority />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: placeholderBg }}>
                        <ListMusic className="h-16 w-16" style={{ color: subtleText }} />
                      </div>
                    )}
                  </div>
                </Link>
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentText }}>Featured Playlist</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold author-font-heading leading-tight" style={{ color: textColor }}>{heroMusic.title}</h2>
                <div
                  className="leading-relaxed max-w-lg mx-auto md:mx-0 rich-content"
                  style={{ color: bodyText }}
                  dangerouslySetInnerHTML={{ __html: sanitize(heroMusic.description || "") }}
                />
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start pt-2">
                  <Link href={`/music/${heroMusic.slug}`}>
                    <Button size="lg" className="font-semibold text-white hover:opacity-90" style={{ backgroundColor: accentColor }}>
                      View Playlist
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── More Books ────────────────────────────────────────────────────────── */}
      {author.heroFocus === "BOOKS" && remainingBooks.length > 0 && (
        <section className="py-14 md:py-16" style={{ backgroundColor: tintBg(5), borderTop: `1px solid ${hairline}` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight author-font-heading" style={{ color: textColor }}>More Books</h2>
              <Link
                href="/books"
                className="text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: accentText }}
              >
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-8">
              {remainingBooks.map((book) => (
                <Link key={book.id} href={`/books/${book.slug}`} className="group space-y-2.5">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden relative shadow-md group-hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: placeholderBg }}>
                    {book.coverImageUrl ? (
                      <Image
                        src={book.coverImageUrl}
                        alt={book.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-10 w-10" style={{ color: subtleText }} />
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
                  </div>
                  <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:underline" style={{ color: textColor }}>{book.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Genre Breakdown ───────────────────────────────────────────────────── */}
      {author.heroFocus === "BOOKS" && genreCounts.length > 0 && (
        <section className="py-12" style={{ backgroundColor: pageBg, borderTop: `1px solid ${hairline}` }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-5 text-center" style={{ color: subtleText }}>Browse by Genre</p>
            <div className="flex flex-wrap justify-center gap-3">
              {genreCounts.map((g) => (
                <Link
                  key={g.id}
                  href="/books"
                  className="px-4 py-2 rounded-full border text-sm font-medium hover:text-white hover:bg-[var(--accent)] transition-colors"
                  style={{ borderColor: accentColor + "40", color: textColor }}
                >
                  {g.name} <span className="opacity-60">· {g.count} {g.count === 1 ? "book" : "books"}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ─────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20" style={{ backgroundColor: tintBg(5), borderTop: `1px solid ${hairline}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: accentText }}>
                {firstName}&rsquo;s Newsletter
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold author-font-heading tracking-tight" style={{ color: textColor }}>
                Letters from {firstName}
              </h2>
              <p className="mt-2 leading-relaxed" style={{ color: bodyText }}>
                New releases, behind-the-scenes notes, and reading recommendations —
                straight to your inbox.
              </p>
            </div>
            <NewsletterInlineForm authorId={author.id} accentColor={accentColor} tone={isDarkPage ? "dark" : "light"} />
          </div>
        </div>
      </section>

      {/* ── Contact CTA ────────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16" style={{ backgroundColor: tintBg(12) }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold" style={{ color: textColor }}>Get in Touch with {firstName}</h2>
            <p className="text-sm mt-1" style={{ color: bodyText }}>Inquiries, collaborations, and media welcome.</p>
          </div>
          <Link href="/contact">
            <Button size="lg">Contact {authorName}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
