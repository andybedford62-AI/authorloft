// Cinematic Template — deep navy editorial with gold accents.
// Hero → Press Strip → Featured Release → Books Grid → Series → About → Newsletter

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, GraduationCap, ListMusic, Mail } from "lucide-react";
import { sanitize } from "@/lib/sanitize";
import { CinematicBooksFilter } from "./cinematic-books-filter";
import { NewsletterInlineForm } from "@/components/author-site/newsletter-inline-form";
import { formatCents } from "@/lib/utils";
import type { HomeTemplateProps } from "./types";

const NAVY_DEEP   = "#050D1C";
const NAVY        = "#0A192F";
const NAVY_CARD   = "#102544";
const GOLD_DEFAULT = "#D4AF37";

const DEFAULT_PRESS_NAMES = [
  "THE SUNDAY TIMES",
  "KIRKUS",
  "PUBLISHERS WEEKLY",
  "THE GUARDIAN",
  "THE NEW YORKER",
  "NPR BOOKS",
];

// Series accent colours (cycles by index)
const SERIES_ACCENTS = [
  ["#1E3A5F", "#2C507F"],
  ["#1F3A2F", "#2A5040"],
  ["#3A1E5F", "#50307F"],
  ["#3A2A1E", "#5A3E28"],
];

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CinematicTemplate({ author, books, courses, music, series }: HomeTemplateProps) {
  const accent       = author.accentColor || GOLD_DEFAULT;
  const authorName   = author.displayName || author.name;
  const firstName    = authorName.split(" ")[0];
  const pressNames   = author.pressOutlets?.length ? author.pressOutlets : DEFAULT_PRESS_NAMES;
  // Hero portrait: an explicit Hero Image wins (matches HeroBanner's own
  // author.heroImageUrl || author.profileImageUrl precedent used by Classic/Bold);
  // falls back to the profile photo so authors who haven't set one still see something.
  const heroPhotoSrc = author.heroImageUrl || author.profileImageUrl;
  // heroEyebrow: minimal type, used only for eyebrow label + Browse CTA in the
  // hero section — this template has no cover-art hero slot (no HeroBanner
  // call here), so heroFocus only ever needs to steer this text, not imagery.
  // The separate Featured Release section below stays Books-only/untouched —
  // it's a distinct, unconfirmed piece of scope.
  const heroEyebrowBook   = author.heroFeaturedBook ?? books.find((b) => b.isFeatured) ?? books[0] ?? null;
  const heroEyebrowCourse = courses.find((c) => c.isFeatured) ?? courses[0] ?? null;
  const heroEyebrowMusic  = music.find((m) => m.isFeatured) ?? music[0] ?? null;
  // Normalized to a common shape — Course/Music have no `caption` field (they
  // have `description` instead), so the eyebrow simply omits it for those two.
  const heroEyebrow: { title: string; caption: string | null } | null =
    author.heroFocus === "COURSES" ? (heroEyebrowCourse && { title: heroEyebrowCourse.title, caption: null }) :
    author.heroFocus === "MUSIC"   ? (heroEyebrowMusic && { title: heroEyebrowMusic.title, caption: null })  :
    heroEyebrowBook;
  const browseHref  = author.heroFocus === "COURSES" ? "/courses" : author.heroFocus === "MUSIC" ? "/music" : "/books";
  const browseLabel = author.heroFocus === "COURSES" ? "Browse Courses" : author.heroFocus === "MUSIC" ? "Browse Music" : "Browse Books";
  // featuredBook: full BookForTemplate, used for the Featured Release section
  const featuredBook = books.find((b) => b.isFeatured) ?? books[0] ?? null;
  const headline    = author.heroTitle    || author.tagline || authorName;
  const subhead     = author.heroSubtitle || (author.shortBio ? stripHtml(author.shortBio).slice(0, 140) : "");
  const location    = author.credentials?.[0] ?? "";
  // credentials[0] is rendered as `location` above, so the hero meta strip
  // shows the remainder.
  const metaCredentials = author.credentials?.slice(1) ?? [];

  return (
    <div style={{ "--accent": accent } as React.CSSProperties}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {author.showHeroBanner !== false && (
      <section
        className="relative overflow-hidden flex items-center"
        style={{
          minHeight: "clamp(580px, 80vh, 920px)",
          background: `
            radial-gradient(ellipse 75% 60% at 30% 50%, ${accent}18 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 75% 30%, #1E3A5F40 0%, transparent 65%),
            ${NAVY_DEEP}
          `,
        }}
      >
        {/* Author portrait — right side with left-fade mask */}
        {heroPhotoSrc && (
          <div
            className="absolute inset-y-0 right-0 hidden md:block"
            style={{
              width: "58%",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 28%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 28%)",
            }}
          >
            <Image
              src={heroPhotoSrc}
              alt={authorName}
              fill
              className="object-cover object-center"
              style={{ filter: "brightness(0.75) contrast(1.05)" }}
              priority
            />
          </div>
        )}

        {/* Text content — left side */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-28">
          <div className="max-w-[380px] lg:max-w-[520px] space-y-6">

            {/* Eyebrow */}
            {heroEyebrow && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-px" style={{ background: accent }} />
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.32em]"
                  style={{ color: accent }}
                >
                  {heroEyebrow.title}
                  {heroEyebrow.caption ? ` · ${heroEyebrow.caption}` : ""}
                </p>
              </div>
            )}

            {/* Headline */}
            <h1
              className="author-font-heading text-[clamp(44px,7vw,96px)] leading-[0.96] tracking-[-0.03em] text-[#FBF6E9]"
              dangerouslySetInnerHTML={{ __html: formatHeadline(headline, accent) }}
            />

            {/* Subhead */}
            {subhead && (
              <p className="text-[17px] leading-relaxed text-[#FBF6E9]/70 max-w-[440px]">
                {subhead}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={browseHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: accent, color: NAVY_DEEP }}
              >
                {browseLabel} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all duration-200 hover:border-opacity-100 hover:-translate-y-0.5 text-[#FBF6E9]"
                style={{ borderColor: accent + "66" }}
              >
                Meet the Author
              </Link>
            </div>

            {/* Meta strip — credentials only.
                A hardcoded ★★★★★ used to lead this row, sourced from nothing:
                every Cinematic author displayed five gold stars regardless of
                whether a single reader had ever rated them. Removed rather than
                left as a fabricated trust signal. Real aggregate ratings are on
                the book pages, where the data actually exists; wiring one up
                here would need getAuthorBooks to carry feedback (see
                FEATURE_BACKLOG.md). The separator is now index-guarded so the
                first credential doesn't start with a stray divider. */}
            {metaCredentials.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t" style={{ borderColor: accent + "22" }}>
                {metaCredentials.map((c, i) => (
                  <span key={i} className="text-[11px] text-[#FBF6E9]/50">
                    {i > 0 && <span className="mx-2" style={{ color: accent + "66" }}>|</span>}
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* ── Press Strip — only shown when author has real press outlets set ── */}
      {author.pressOutlets?.length > 0 && (
        <div
          className="py-5 border-y"
          style={{ background: NAVY_DEEP, borderColor: accent + "22" }}
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {author.pressOutlets.map((name) => (
                <span
                  key={name}
                  className="author-font-heading italic text-[13px] tracking-wide opacity-40 text-[#FBF6E9]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Featured Release ─────────────────────────────────────────────── */}
      {/* Books-specific — hidden when the hero is focused on Courses/Music, so
          a Music-focused homepage doesn't lead with someone else's content
          type further down the page. */}
      {author.heroFocus === "BOOKS" && featuredBook && (
        <section style={{ background: NAVY }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

              {/* Book cover with tilt effect */}
              <div className="flex justify-center md:justify-end">
                <div className="relative">
                  {/* Decorative "01" */}
                  <span
                    className="absolute -top-4 -left-6 author-font-heading text-[160px] leading-none font-bold select-none pointer-events-none hidden lg:block"
                    style={{ color: accent + "10" }}
                  >
                    01
                  </span>
                  <Link
                    href={`/books/${featuredBook.slug}`}
                    aria-label={`View ${featuredBook.title}`}
                    className="group relative block w-52 sm:w-64 aspect-[2/3] rounded-sm overflow-hidden"
                    style={{
                      transform: "perspective(800px) rotateY(-12deg) rotateX(3deg)",
                      boxShadow: "15px 20px 30px rgba(0,0,0,0.55), 4px 8px 12px rgba(0,0,0,0.35)",
                    }}
                  >
                    {featuredBook.coverImageUrl ? (
                      <Image src={featuredBook.coverImageUrl} alt={featuredBook.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: NAVY_CARD }}>
                        <BookOpen className="w-16 h-16" style={{ color: accent + "55" }} />
                      </div>
                    )}
                    {/* Hover accent: inner border + gradient glow */}
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ boxShadow: `inset 0 0 0 2px ${accent}`, background: `linear-gradient(to top, ${accent}22, transparent 55%)` }}
                    />
                  </Link>
                </div>
              </div>

              {/* Book details */}
              <div className="space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-3" style={{ color: accent }}>
                    The Latest
                    {featuredBook.releaseDate
                      ? ` · ${new Date(featuredBook.releaseDate).getFullYear()}`
                      : ""}
                  </p>
                  <h2 className="author-font-heading text-[clamp(36px,5vw,64px)] leading-tight text-[#FBF6E9]">
                    {featuredBook.title}
                  </h2>
                  {featuredBook.subtitle && (
                    <p className="author-font-heading italic mt-1 text-lg" style={{ color: accent }}>
                      {featuredBook.subtitle}
                    </p>
                  )}
                </div>

                {featuredBook.shortDescription && (
                  <div
                    className="text-[17px] leading-relaxed text-[#FBF6E9]/65 rich-content rich-content-invert"
                    dangerouslySetInnerHTML={{ __html: sanitize(featuredBook.shortDescription) }}
                  />
                )}

                {/* Pull quote (caption used as pull quote if set) */}
                {featuredBook.caption && (
                  <blockquote
                    className="border-l-2 pl-4 italic text-[#FBF6E9]/60 text-base"
                    style={{ borderColor: accent }}
                  >
                    {featuredBook.caption}
                  </blockquote>
                )}

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href={`/books/${featuredBook.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90"
                    style={{ background: accent, color: NAVY_DEEP }}
                  >
                    {featuredBook.priceCents > 0
                      ? `Buy · ${formatPrice(featuredBook.priceCents)}`
                      : "View Book"}
                  </Link>
                  <Link
                    href={`/books/${featuredBook.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border text-[#FBF6E9] transition-all duration-200"
                    style={{ borderColor: accent + "55" }}
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── All Books ─────────────────────────────────────────────────────── */}
      {author.heroFocus === "BOOKS" && books.length > 0 && (
        <section style={{ background: NAVY_DEEP }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-2" style={{ color: accent }}>
                  The Shelf
                </p>
                <h2 className="author-font-heading text-[clamp(28px,4vw,48px)] text-[#FBF6E9]">
                  The complete shelf
                </h2>
              </div>
              <Link
                href="/books"
                className="hidden sm:flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: accent }}
              >
                All books <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <CinematicBooksFilter books={books} accentColor={accent} />
          </div>
        </section>
      )}

      {/* ── All Courses (replaces the Featured Release + Books Grid pair when
               focus is Courses — the hero already shows the featured course
               large, and a full search/filter grid is more than a teaser
               section needs) ────────────────────────────────────────────── */}
      {author.heroFocus === "COURSES" && courses.length > 0 && (
        <section style={{ background: NAVY_DEEP }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-2" style={{ color: accent }}>
                  The Learning
                </p>
                <h2 className="author-font-heading text-[clamp(28px,4vw,48px)] text-[#FBF6E9]">
                  All courses
                </h2>
              </div>
              <Link
                href="/courses"
                className="hidden sm:flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: accent }}
              >
                All courses <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group block">
                  <div className="relative aspect-video rounded-sm overflow-hidden mb-3" style={{ background: NAVY_CARD }}>
                    {course.coverImageUrl ? (
                      <Image src={course.coverImageUrl} alt={course.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="w-10 h-10" style={{ color: accent + "55" }} />
                      </div>
                    )}
                  </div>
                  <h3 className="author-font-heading text-lg text-[#FBF6E9] group-hover:opacity-80 transition-opacity">
                    {course.title}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: accent }}>
                    {course.priceCents === 0 ? "Free" : formatCents(course.priceCents)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── All Playlists ─────────────────────────────────────────────────── */}
      {author.heroFocus === "MUSIC" && music.length > 0 && (
        <section style={{ background: NAVY_DEEP }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-2" style={{ color: accent }}>
                  The Playlist
                </p>
                <h2 className="author-font-heading text-[clamp(28px,4vw,48px)] text-[#FBF6E9]">
                  All music
                </h2>
              </div>
              <Link
                href="/music"
                className="hidden sm:flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: accent }}
              >
                All music <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {music.map((list) => (
                <Link key={list.id} href={`/music/${list.slug}`} className="group block">
                  <div className="relative aspect-video rounded-sm overflow-hidden mb-3" style={{ background: NAVY_CARD }}>
                    {list.coverImageUrl ? (
                      <Image src={list.coverImageUrl} alt={list.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ListMusic className="w-10 h-10" style={{ color: accent + "55" }} />
                      </div>
                    )}
                  </div>
                  <h3 className="author-font-heading text-lg text-[#FBF6E9] group-hover:opacity-80 transition-opacity">
                    {list.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by Series ─────────────────────────────────────────────── */}
      {author.heroFocus === "BOOKS" && series.length > 0 && (
        <section style={{ background: NAVY }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-24">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-2" style={{ color: accent }}>
                Collections
              </p>
              <h2 className="author-font-heading text-[clamp(28px,4vw,48px)] text-[#FBF6E9]">
                Choose your series
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {series.map((s, i) => {
                const [colorA, colorB] = SERIES_ACCENTS[i % SERIES_ACCENTS.length];
                const cover = s.books.find((b) => b.coverImageUrl);
                return (
                  <Link
                    key={s.id}
                    href={`/series/${s.slug}`}
                    className="group relative overflow-hidden rounded-sm transition-transform duration-300 hover:-translate-y-1.5"
                    style={{
                      background: `linear-gradient(160deg, ${colorA} 0%, ${colorB} 100%)`,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                    }}
                  >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050D1C]/90 via-[#050D1C]/30 to-transparent" />

                    {/* Tilted cover */}
                    {cover?.coverImageUrl && (
                      <div
                        className="absolute top-4 right-4 w-20 aspect-[2/3] rounded-sm overflow-hidden opacity-70"
                        style={{
                          transform: "perspective(600px) rotateY(-14deg)",
                          boxShadow: "6px 8px 16px rgba(0,0,0,0.5)",
                        }}
                      >
                        <Image src={cover.coverImageUrl} alt={s.name} fill className="object-cover" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 p-7 pt-28 sm:pt-32">
                      <span
                        className="inline-block text-[10px] font-bold uppercase tracking-widest mb-2 px-2 py-0.5 rounded-full"
                        style={{ background: accent + "22", color: accent }}
                      >
                        {s.books.length} {s.books.length === 1 ? "book" : "books"}
                      </span>
                      <h3 className="author-font-heading text-[22px] text-[#FBF6E9] leading-tight mb-2">
                        {s.name}
                      </h3>
                      {s.description && (
                        <p className="text-sm text-[#FBF6E9]/60 line-clamp-2 mb-4">
                          {s.description}
                        </p>
                      )}
                      <span
                        className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                        style={{ color: accent }}
                      >
                        Explore series
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section style={{ background: NAVY_DEEP }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

            {/* Portrait */}
            <div className="flex justify-center">
              <div className="relative">
                <div
                  className="relative w-72 sm:w-80 aspect-[4/5] overflow-hidden"
                  style={{
                    borderRadius: "0 0 50px 0",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
                  }}
                >
                  {author.profileImageUrl ? (
                    <Image src={author.profileImageUrl} alt={authorName} fill className="object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-[#FBF6E9]/20" style={{ background: NAVY_CARD }}>
                      {author.name[0]}
                    </div>
                  )}
                </div>
                {/* Location tag */}
                {location && (
                  <div
                    className="absolute bottom-4 left-0 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest"
                    style={{ background: accent, color: NAVY_DEEP, borderRadius: "0 4px 4px 0" }}
                  >
                    {location}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-3" style={{ color: accent }}>
                  About
                </p>
                <h2 className="author-font-heading text-[clamp(28px,4vw,48px)] leading-tight text-[#FBF6E9]">
                  {authorName}
                </h2>
              </div>
              {author.shortBio ? (
                <div
                  className="text-[17px] leading-[1.75] text-[#FBF6E9]/65 rich-content rich-content-invert"
                  dangerouslySetInnerHTML={{ __html: sanitize(author.shortBio) }}
                />
              ) : (
                <p className="text-[17px] leading-[1.75] text-[#FBF6E9]/65">
                  Author bio coming soon.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border text-[#FBF6E9] transition-all duration-200 hover:border-opacity-80"
                  style={{ borderColor: accent + "55" }}
                >
                  The full story <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80"
                  style={{ color: accent }}
                >
                  <Mail className="w-4 h-4" /> Email {firstName}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <section
        style={{ background: NAVY, borderTop: `1px solid ${GOLD_DEFAULT}22` }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-3" style={{ color: accent }}>
                {firstName}'s Dispatch · Monthly
              </p>
              <h2 className="author-font-heading text-[clamp(28px,3.5vw,44px)] leading-tight text-[#FBF6E9] mb-3">
                Letters from {firstName}.
              </h2>
              <p className="text-base text-[#FBF6E9]/55">
                New releases, behind-the-scenes notes, and reading recommendations delivered monthly.
              </p>
            </div>

            <NewsletterInlineForm
              authorId={author.id}
              accentColor={accent}
              tone="dark"
              rounded="full"
              inputBg={NAVY_DEEP}
              buttonTextColor={NAVY_DEEP}
            />
          </div>
        </div>
      </section>

    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Make the last word of the headline italic gold for the cinematic effect. */
function formatHeadline(text: string, accent: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) return `<em style="color:${accent}">${text}</em>`;
  const last   = words.pop()!;
  const rest   = words.join(" ");
  return `${rest} <em style="color:${accent}">${last}</em>`;
}
