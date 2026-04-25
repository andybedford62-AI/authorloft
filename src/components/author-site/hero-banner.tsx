import Link from "next/link";
import Image from "next/image";
import { BookCoverTilt } from "@/components/author-site/book-cover-tilt";
import { getTheme } from "@/lib/themes";
import type { AuthorForTemplate } from "./templates/types";

interface HeroBannerProps {
  author: AuthorForTemplate;
  featuredBook: {
    title: string;
    slug: string;
    coverImageUrl: string | null;
    caption?: string | null;
  } | null;
}

function getHeroColors(siteTheme: string) {
  const theme = getTheme(siteTheme);
  const darkBgThemes = ["dark-elegant", "scifi"];
  const bg = darkBgThemes.includes(siteTheme) ? theme.preview.bg : theme.preview.primary;
  return { bg, accent: theme.preview.accent };
}

/** Rough luminance check — returns true if color is light (use dark text on it). */
function isLightColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export function HeroBanner({ author, featuredBook }: HeroBannerProps) {
  const authorName = author.displayName || author.name;
  const { bg, accent } = getHeroColors(author.siteTheme);
  const buyHref = featuredBook ? `/books/${featuredBook.slug}` : "/books";
  const photoSrc = author.heroImageUrl || author.profileImageUrl;
  const layout = author.heroLayout ?? "author-right";

  // ── Portrait layout ─────────────────────────────────────────────────────────
  if (layout === "portrait") {
    return (
      <section
        className="relative w-full overflow-hidden"
        style={{ background: bg, minHeight: "580px" }}
        aria-label="Author hero"
      >
        {/* Full-bleed background photo */}
        {photoSrc && (
          <div className="absolute inset-0">
            <Image
              src={photoSrc}
              alt={authorName}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        )}

        {/* Dark gradient overlay for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, ${bg}cc 0%, ${bg}88 35%, ${bg}99 65%, ${bg}ee 100%)`,
          }}
        />

        {/* Accent glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${accent}22 0%, transparent 70%)`,
          }}
        />

        {/* Centered content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20" style={{ minHeight: "580px" }}>
          {author.heroTitle && (
            <p className="text-xs font-bold uppercase tracking-[0.35em] mb-4" style={{ color: accent }}>
              {author.heroTitle}
            </p>
          )}

          <h1 className="text-5xl xl:text-6xl font-bold text-white leading-tight font-heading mb-4">
            {authorName}
          </h1>

          {author.heroSubtitle && (
            <p className="text-base leading-relaxed max-w-lg mb-8" style={{ color: "rgba(255,255,255,0.72)" }}>
              {author.heroSubtitle}
            </p>
          )}

          {featuredBook && (
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.40)" }}>
              {featuredBook.title}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={buyHref}
              className="py-3 px-8 text-sm font-bold uppercase tracking-widest rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              style={{
                background: accent,
                color: isLightColor(accent) ? "#111" : "#fff",
                boxShadow: `0 4px 24px ${accent}55`,
              }}
            >
              Buy Now
            </Link>
            <Link
              href="/about"
              className="py-3 px-8 text-sm font-semibold uppercase tracking-widest rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5"
              style={{ border: `2px solid ${accent}60`, color: "rgba(255,255,255,0.85)" }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ── Author-left / Author-right (3-column) ────────────────────────────────────
  // author-right: book(order1) | content(order2) | photo(order3)
  // author-left:  photo(order1) | content(order2) | book(order3)
  const bookOrder  = layout === "author-left" ? 3 : 1;
  const photoOrder = layout === "author-left" ? 1 : 3;

  const BookCol = (
    <div
      className="flex justify-end items-center pr-6"
      style={{ perspective: "1200px", order: bookOrder }}
    >
      {featuredBook ? (
        <div className="relative">
          <div
            className="absolute -inset-10 rounded-full opacity-60 blur-2xl pointer-events-none"
            style={{ background: `radial-gradient(ellipse, ${accent}40 0%, transparent 70%)` }}
          />
          <BookCoverTilt
            href={buyHref}
            title={featuredBook.title}
            coverImageUrl={featuredBook.coverImageUrl}
            caption={featuredBook.caption}
            width={240}
            height={360}
          />
        </div>
      ) : (
        <div className="w-48 h-72 rounded-xl opacity-20" style={{ background: `${accent}40` }} />
      )}
    </div>
  );

  const PhotoCol = (
    <div
      className="relative flex items-end"
      style={{
        alignSelf: "stretch",
        minHeight: "480px",
        order: photoOrder,
        paddingLeft: layout === "author-left" ? 0 : "16px",
        paddingRight: layout === "author-left" ? "16px" : 0,
      }}
    >
      {photoSrc ? (
        <>
          <div className="absolute inset-0">
            <Image
              src={photoSrc}
              alt={authorName}
              fill
              className="object-cover object-top"
              style={{
                maskImage:
                  "radial-gradient(ellipse 78% 82% at 48% 38%, #000 35%, rgba(0,0,0,0.75) 58%, transparent 85%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 78% 82% at 48% 38%, #000 35%, rgba(0,0,0,0.75) 58%, transparent 85%)",
              }}
            />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 50% at 50% 30%, ${accent}18 0%, transparent 65%)`,
            }}
          />
        </>
      ) : (
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold self-center mx-auto"
          style={{ background: `${accent}20`, color: accent }}
        >
          {author.name[0]}
        </div>
      )}

      {/* Author name badge */}
      <div
        className="absolute bottom-6 z-10 text-left"
        style={{ left: layout === "author-left" ? "auto" : "16px", right: layout === "author-left" ? "16px" : "auto", textAlign: layout === "author-left" ? "right" : "left" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>
          Meet the Author
        </p>
        <p
          className="text-2xl xl:text-3xl font-bold leading-none"
          style={{ color: accent, textShadow: `0 2px 16px ${accent}40` }}
        >
          {authorName.toUpperCase()}
        </p>
      </div>
    </div>
  );

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: bg }}
      aria-label="Author hero"
    >
      {/* Soft accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 60%, ${accent}22 0%, transparent 70%)`,
        }}
      />

      {/* ── Mobile layout ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-16 text-center md:hidden">
        {featuredBook && (
          <BookCoverTilt
            href={buyHref}
            title={featuredBook.title}
            coverImageUrl={featuredBook.coverImageUrl}
            caption={featuredBook.caption}
            width={160}
            height={240}
          />
        )}
        <div className="flex flex-col items-center gap-4 max-w-sm">
          {author.heroTitle && (
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>
              {author.heroTitle}
            </p>
          )}
          <h1 className="text-4xl font-bold text-white leading-tight font-heading">{authorName}</h1>
          {author.heroSubtitle && (
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
              {author.heroSubtitle}
            </p>
          )}
          <div className="flex flex-col gap-3 w-full pt-2">
            <Link
              href={buyHref}
              className="w-full py-3 px-6 text-sm font-bold uppercase tracking-widest rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              style={{ background: accent, color: isLightColor(accent) ? "#111" : "#fff", boxShadow: `0 4px 24px ${accent}55` }}
            >
              Buy Now
            </Link>
            <Link
              href="/about"
              className="w-full py-3 px-6 text-sm font-semibold uppercase tracking-widest rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5"
              style={{ border: `2px solid ${accent}60`, color: "rgba(255,255,255,0.85)" }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* ── Desktop layout: 3-column grid ── */}
      <div
        className="relative z-10 hidden md:grid max-w-7xl mx-auto px-8"
        style={{
          gridTemplateColumns: "1fr 300px 1fr",
          alignItems: "center",
          gap: "32px",
          minHeight: "580px",
          paddingTop: "64px",
          paddingBottom: "64px",
        }}
      >
        {BookCol}

        {/* Center: Content */}
        <div className="flex flex-col items-center text-center gap-5" style={{ order: 2 }}>
          {author.heroTitle && (
            <p className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: accent }}>
              {author.heroTitle}
            </p>
          )}
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight font-heading">
            {authorName}
          </h1>
          {author.heroSubtitle && (
            <p className="text-sm leading-relaxed max-w-[260px]" style={{ color: "rgba(255,255,255,0.68)" }}>
              {author.heroSubtitle}
            </p>
          )}
          <div className="flex flex-col gap-3 w-full pt-1">
            <Link
              href={buyHref}
              className="w-full py-3 px-4 text-sm font-bold uppercase tracking-widest rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              style={{
                background: accent,
                color: isLightColor(accent) ? "#111" : "#fff",
                boxShadow: `0 4px 24px ${accent}55`,
              }}
            >
              Buy Now
            </Link>
            <Link
              href="/about"
              className="w-full py-3 px-4 text-sm font-semibold uppercase tracking-widest rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5"
              style={{ border: `2px solid ${accent}60`, color: "rgba(255,255,255,0.85)" }}
            >
              Learn More
            </Link>
          </div>
          {featuredBook && (
            <p className="text-xs uppercase tracking-widest pt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              {featuredBook.title}
            </p>
          )}
        </div>

        {PhotoCol}
      </div>
    </section>
  );
}
