// Cinematic Template — deep navy editorial with gold accents.
// Hero → Press Strip → Featured Release → Books Grid → Series → About → Newsletter

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { sanitize } from "@/lib/sanitize";
import { CinematicBooksFilter } from "./cinematic-books-filter";
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

export function CinematicTemplate({ author, books, series }: HomeTemplateProps) {
  const accent       = author.accentColor || GOLD_DEFAULT;
  const authorName   = author.displayName || author.name;
  const pressNames   = author.pressOutlets?.length ? author.pressOutlets : DEFAULT_PRESS_NAMES;
  // heroEyebrow: minimal type, used only for eyebrow label in the hero section
  const heroEyebrow = author.heroFeaturedBook ?? books.find((b) => b.isFeatured) ?? books[0] ?? null;
  // featuredBook: full BookForTemplate, used for the Featured Release section
  const featuredBook = books.find((b) => b.isFeatured) ?? books[0] ?? null;
  const headline    = author.heroTitle    || author.tagline || authorName;
  const subhead     = author.heroSubtitle || (author.shortBio ? stripHtml(author.shortBio).slice(0, 140) : "");
  const location    = author.credentials?.[0] ?? "";

  return (
    <div style={{ "--accent": accent } as React.CSSProperties}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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
        {author.profileImageUrl && (
          <div
            className="absolute inset-y-0 right-0 hidden md:block"
            style={{
              width: "58%",
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 28%)",
              maskImage: "linear-gradient(to right, transparent 0%, black 28%)",
            }}
          >
            <Image
              src={author.profileImageUrl}
              alt={authorName}
              fill
              className="object-cover object-top"
              style={{ filter: "brightness(0.75) contrast(1.05)" }}
              priority
            />
          </div>
        )}

        {/* Text content — left side */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-28">
          <div className="max-w-[520px] space-y-6">

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
              className="font-heading text-[clamp(44px,7vw,96px)] leading-[0.96] tracking-[-0.03em] text-[#FBF6E9]"
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
                href="/books"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: accent, color: NAVY_DEEP }}
              >
                Browse Books <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all duration-200 hover:border-opacity-100 hover:-translate-y-0.5 text-[#FBF6E9]"
                style={{ borderColor: accent + "66" }}
              >
                Meet the Author
              </Link>
            </div>

            {/* Meta strip */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t" style={{ borderColor: accent + "22" }}>
              <span className="text-[11px] font-medium" style={{ color: accent }}>★★★★★</span>
              {author.credentials?.slice(1).map((c, i) => (
                <span key={i} className="text-[11px] text-[#FBF6E9]/50">
                  <span className="mx-2" style={{ color: accent + "66" }}>|</span>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Press Strip ──────────────────────────────────────────────────── */}
      <div
        className="py-5 border-y"
        style={{ background: NAVY_DEEP, borderColor: accent + "22" }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-10">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {pressNames.map((name) => (
              <span
                key={name}
                className="font-heading italic text-[13px] tracking-wide opacity-40 text-[#FBF6E9]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Release ─────────────────────────────────────────────── */}
      {featuredBook && (
        <section style={{ background: NAVY }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

              {/* Book cover with tilt effect */}
              <div className="flex justify-center md:justify-end">
                <div className="relative">
                  {/* Decorative "01" */}
                  <span
                    className="absolute -top-4 -left-6 font-heading text-[160px] leading-none font-bold select-none pointer-events-none hidden lg:block"
                    style={{ color: accent + "10" }}
                  >
                    01
                  </span>
                  <div
                    className="relative w-52 sm:w-64 aspect-[2/3] rounded-sm overflow-hidden"
                    style={{
                      transform: "perspective(800px) rotateY(-12deg) rotateX(3deg)",
                      boxShadow: "15px 20px 30px rgba(0,0,0,0.55), 4px 8px 12px rgba(0,0,0,0.35)",
                    }}
                  >
                    {featuredBook.coverImageUrl ? (
                      <Image src={featuredBook.coverImageUrl} alt={featuredBook.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: NAVY_CARD }}>
                        <BookOpen className="w-16 h-16" style={{ color: accent + "55" }} />
                      </div>
                    )}
                  </div>
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
                  <h2 className="font-heading text-[clamp(36px,5vw,64px)] leading-tight text-[#FBF6E9]">
                    {featuredBook.title}
                  </h2>
                  {featuredBook.subtitle && (
                    <p className="font-heading italic mt-1 text-lg" style={{ color: accent }}>
                      {featuredBook.subtitle}
                    </p>
                  )}
                </div>

                {featuredBook.shortDescription && (
                  <p className="text-[17px] leading-relaxed text-[#FBF6E9]/65">
                    {featuredBook.shortDescription}
                  </p>
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
      {books.length > 0 && (
        <section style={{ background: NAVY_DEEP }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-2" style={{ color: accent }}>
                  The Shelf
                </p>
                <h2 className="font-heading text-[clamp(28px,4vw,48px)] text-[#FBF6E9]">
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

      {/* ── Browse by Series ─────────────────────────────────────────────── */}
      {series.length > 0 && (
        <section style={{ background: NAVY }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 md:py-24">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-2" style={{ color: accent }}>
                Collections
              </p>
              <h2 className="font-heading text-[clamp(28px,4vw,48px)] text-[#FBF6E9]">
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
                      <h3 className="font-heading text-[22px] text-[#FBF6E9] leading-tight mb-2">
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
                <h2 className="font-heading text-[clamp(28px,4vw,48px)] leading-tight text-[#FBF6E9]">
                  {authorName}
                </h2>
              </div>
              {author.shortBio ? (
                <div
                  className="text-[17px] leading-[1.75] text-[#FBF6E9]/65 rich-content"
                  dangerouslySetInnerHTML={{ __html: sanitize(author.shortBio) }}
                />
              ) : (
                <p className="text-[17px] leading-[1.75] text-[#FBF6E9]/65">
                  Author bio coming soon.
                </p>
              )}
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border text-[#FBF6E9] transition-all duration-200 hover:border-opacity-80"
                style={{ borderColor: accent + "55" }}
              >
                The full story <ArrowRight className="w-4 h-4" />
              </Link>
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
                The Dispatch · Monthly
              </p>
              <h2 className="font-heading text-[clamp(28px,3.5vw,44px)] leading-tight text-[#FBF6E9] mb-3">
                Letters from the loft.
              </h2>
              <p className="text-base text-[#FBF6E9]/55">
                New releases, behind-the-scenes notes, and reading recommendations delivered monthly.
              </p>
            </div>

            <form
              action="/contact"
              method="get"
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-5 py-3 rounded-full text-sm text-[#FBF6E9] placeholder-[#FBF6E9]/30 border outline-none focus:border-opacity-80 transition-colors"
                style={{
                  background: NAVY_DEEP,
                  borderColor: accent + "44",
                }}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: accent, color: NAVY_DEEP }}
              >
                Subscribe →
              </button>
            </form>
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
