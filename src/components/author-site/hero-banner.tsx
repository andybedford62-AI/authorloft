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
  // dark-elegant and scifi: body bg is already very dark; primary is their text color
  const darkBgThemes = ["dark-elegant", "scifi"];
  const bg = darkBgThemes.includes(siteTheme) ? theme.preview.bg : theme.preview.primary;
  return { bg, accent: theme.preview.accent };
}

export function HeroBanner({ author, featuredBook }: HeroBannerProps) {
  const authorName = author.displayName || author.name;
  const { bg, accent } = getHeroColors(author.siteTheme);
  const buyHref = featuredBook ? `/books/${featuredBook.slug}` : "/books";
  const photoSrc = author.heroImageUrl || author.profileImageUrl;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: bg }}
      aria-label="Author hero"
    >
      {/* Soft accent glow at center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 60%, ${accent}22 0%, transparent 70%)`,
        }}
      />

      {/* ── Mobile layout (< md): centered stack ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-12 text-center md:hidden">
        {featuredBook && (
          <BookCoverTilt
            href={buyHref}
            title={featuredBook.title}
            coverImageUrl={featuredBook.coverImageUrl}
            caption={featuredBook.caption}
            width={120}
            height={180}
          />
        )}
        <div className="flex flex-col items-center gap-4 max-w-sm">
          {author.heroTitle && (
            <p
              className="text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: accent }}
            >
              {author.heroTitle}
            </p>
          )}
          <h1 className="text-4xl font-bold text-white leading-tight font-heading">
            {authorName}
          </h1>
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

      {/* ── Desktop layout (md+): 3-column grid ── */}
      <div
        className="relative z-10 hidden md:grid max-w-7xl mx-auto px-8"
        style={{
          gridTemplateColumns: "1fr 300px 1fr",
          alignItems: "center",
          gap: "32px",
          minHeight: "435px",
          paddingTop: "48px",
          paddingBottom: "48px",
        }}
      >

        {/* ── Left: Book cover ── */}
        <div className="flex justify-end items-center pr-6" style={{ perspective: "1200px" }}>
          {featuredBook ? (
            <div className="relative">
              {/* Book halo */}
              <div
                className="absolute -inset-10 rounded-full opacity-60 blur-2xl pointer-events-none"
                style={{ background: `radial-gradient(ellipse, ${accent}40 0%, transparent 70%)` }}
              />
              <BookCoverTilt
                href={buyHref}
                title={featuredBook.title}
                coverImageUrl={featuredBook.coverImageUrl}
                caption={featuredBook.caption}
                width={200}
                height={300}
              />
            </div>
          ) : (
            <div
              className="w-48 h-72 rounded-xl opacity-20"
              style={{ background: `${accent}40` }}
            />
          )}
        </div>

        {/* ── Center: Content ── */}
        <div className="flex flex-col items-center text-center gap-5">
          {author.heroTitle && (
            <p
              className="text-xs font-bold uppercase tracking-[0.35em]"
              style={{ color: accent }}
            >
              {author.heroTitle}
            </p>
          )}

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight font-heading">
            {authorName}
          </h1>

          {author.heroSubtitle && (
            <p
              className="text-sm leading-relaxed max-w-[260px]"
              style={{ color: "rgba(255,255,255,0.68)" }}
            >
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
              style={{
                border: `2px solid ${accent}60`,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Learn More
            </Link>
          </div>

          {featuredBook && (
            <p
              className="text-xs uppercase tracking-widest pt-1"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {featuredBook.title}
            </p>
          )}
        </div>

        {/* ── Right: Author photo ── */}
        <div className="relative flex items-end pl-4" style={{ alignSelf: "stretch", minHeight: "360px" }}>
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
              {/* Subtle accent glow behind author */}
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

          {/* Author name badge — bottom left of photo column */}
          <div className="absolute bottom-6 left-4 z-10 text-left">
            <p
              className="text-xs font-semibold uppercase tracking-[0.28em] mb-1"
              style={{ color: "rgba(255,255,255,0.50)" }}
            >
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
      </div>
    </section>
  );
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
