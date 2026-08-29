import Link from "next/link";
import Image from "next/image";
import { GraduationCap, ListMusic } from "lucide-react";
import { BookCoverTilt } from "@/components/author-site/book-cover-tilt";
import { FlatCoverCard } from "@/components/author-site/flat-cover-card";
import { getTheme } from "@/lib/themes";
import { THEME_HERO_IDS } from "@/lib/theme-hero-manifest";
import { readableTextOn } from "@/lib/color-contrast";
import type { AuthorForTemplate } from "./templates/types";
import type { HeroFocusType } from "@/lib/site-pages";

interface HeroBannerProps {
  author: AuthorForTemplate;
  focus: HeroFocusType;
  featuredItem: {
    title: string;
    slug: string;
    coverImageUrl: string | null;
    caption?: string | null;
  } | null;
}

const FOCUS_CONFIG: Record<
  HeroFocusType,
  { ctaLabel: string; hrefBase: string; useTilt: boolean; noun: string; icon: typeof GraduationCap; personLabel: string }
> = {
  // icon is only ever read for non-tilt focuses (see useTilt), BOOKS keeps BookCoverTilt's own fallback icon.
  BOOKS: { ctaLabel: "Buy Now", hrefBase: "/books", useTilt: true, noun: "Books", icon: GraduationCap, personLabel: "Meet the Author" },
  COURSES: { ctaLabel: "Enroll Now", hrefBase: "/courses", useTilt: false, noun: "Courses", icon: GraduationCap, personLabel: "Meet the Creator" },
  MUSIC: { ctaLabel: "Listen Now", hrefBase: "/music", useTilt: false, noun: "Music", icon: ListMusic, personLabel: "Meet the Creator" },
};

// Background and scenic image stay theme-derived. The accent deliberately does
// NOT come from here -- see the accent resolution in HeroBanner below.
function getHeroColors(siteTheme: string) {
  const theme = getTheme(siteTheme);
  const darkBgThemes = ["dark-elegant", "scifi"];
  const bg = darkBgThemes.includes(siteTheme) ? theme.preview.bg : theme.preview.primary;
  // Hero image resolution: an explicit defaultHeroImageUrl wins; otherwise fall
  // back to the naming convention /images/themes/{id}-hero.jpg if that file was
  // present at build time (see THEME_HERO_IDS). No file → undefined → solid colour.
  const heroImage =
    theme.defaultHeroImageUrl ??
    (THEME_HERO_IDS.includes(theme.id) ? `/images/themes/${theme.id}-hero.jpg` : undefined);
  return { bg, defaultHeroImageUrl: heroImage };
}

export function HeroBanner({ author, focus, featuredItem }: HeroBannerProps) {
  const authorName = author.displayName || author.name;
  const config = FOCUS_CONFIG[focus];
  // The 3-column layouts' eyebrow shows author.heroTitle — a free-text field
  // the author types themselves — for Books, since the H1 there is just the
  // author's name and heroTitle is the only content-flavored label available.
  // For Courses/Music, ignore that (usually stale book-era copy an author
  // never thought to update) and show the featured item's own title instead,
  // so the eyebrow always reflects what's actually being showcased.
  const eyebrowText = focus === "BOOKS" ? author.heroTitle : featuredItem?.title;
  const { bg, defaultHeroImageUrl } = getHeroColors(author.siteTheme);
  // Accent comes from the author, not the theme. resolveAccentColor() (see
  // lib/themes.ts) is documented as the effective accent "across the public
  // site" and already falls back to the theme accent for anyone without a
  // PREMIUM custom colour -- the layout resolves it once and hands it down as
  // author.accentColor, which every template uses. This hero used to re-derive
  // it straight from the theme instead, so a PREMIUM author who paid for a
  // custom accent got a hero that ignored it while the sections below honoured
  // it: two different colours on one screen.
  const accent = author.accentColor;
  // PREMIUM two-tone override — falls back to accent-only styling when not set.
  const secondary = author.secondaryColor || accent;
  const hasSecondary = !!author.secondaryColor;
  const buyHref = featuredItem ? `${config.hrefBase}/${featuredItem.slug}` : config.hrefBase;
  // Author portrait — their own uploads only. The theme's scenic image is NOT a
  // portrait stand-in; it's used as the full hero backdrop below (subgenre themes).
  const photoSrc = author.heroImageUrl || author.profileImageUrl;
  const layout = author.heroLayout ?? "author-right";

  // Subgenre palettes (mountain/scuba/aviation) ship a scenic image used as the
  // full-bleed hero background, behind all content, with a dark overlay for text.
  const sceneBg = defaultHeroImageUrl;
  const SceneBackdrop = sceneBg ? (
    <>
      <div className="absolute inset-0">
        <Image src={sceneBg} alt="" fill priority className="object-cover object-center" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.58) 100%)" }}
      />
    </>
  ) : null;

  // ── Classic layout (formerly "portrait") — accent bg, text left, book right ──
  if (layout === "portrait") {
    return (
      <section
        className="relative w-full overflow-hidden py-10 px-4"
        style={{ backgroundColor: accent }}
        aria-label="Author hero"
      >
        {SceneBackdrop}
        {/* Depth overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-black/40 pointer-events-none" />
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-25 bg-white" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-2xl pointer-events-none opacity-20 bg-white" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 py-6">

          {/* Text */}
          <div className="flex-1 text-white space-y-5">
            {author.heroTitle && (
              <span className="block text-sm font-medium uppercase tracking-widest opacity-70">
                {author.heroTitle}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight author-font-heading">
              {featuredItem?.title || `${config.noun} by ${authorName}`}
            </h1>
            {author.heroSubtitle && (
              <p className="text-white/80 text-lg max-w-md">{author.heroSubtitle}</p>
            )}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href={buyHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                style={{ background: "#fff", color: accent }}
              >
                {config.ctaLabel}
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest text-white/85 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
                style={{ border: hasSecondary ? `1px solid ${secondary}80` : "1px solid rgba(255,255,255,0.4)" }}
              >
                {config.personLabel}
              </Link>
            </div>
          </div>

          {/* Featured item cover */}
          {featuredItem && (
            <div className="flex-shrink-0">
              {config.useTilt ? (
                <BookCoverTilt
                  href={buyHref}
                  title={featuredItem.title}
                  coverImageUrl={featuredItem.coverImageUrl}
                  caption={featuredItem.caption}
                  width={130}
                  height={195}
                />
              ) : (
                <FlatCoverCard
                  href={buyHref}
                  title={featuredItem.title}
                  coverImageUrl={featuredItem.coverImageUrl}
                  caption={featuredItem.caption}
                  width={260}
                  height={146}
                  icon={config.icon}
                />
              )}
            </div>
          )}
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
      {featuredItem ? (
        <div className="relative">
          <div
            className="absolute -inset-10 rounded-full opacity-60 blur-2xl pointer-events-none"
            style={{ background: `radial-gradient(ellipse, ${accent}40 0%, transparent 70%)` }}
          />
          {config.useTilt ? (
            <BookCoverTilt
              href={buyHref}
              title={featuredItem.title}
              coverImageUrl={featuredItem.coverImageUrl}
              caption={featuredItem.caption}
              width={240}
              height={360}
            />
          ) : (
            <FlatCoverCard
              href={buyHref}
              title={featuredItem.title}
              coverImageUrl={featuredItem.coverImageUrl}
              caption={featuredItem.caption}
              width={400}
              height={225}
              icon={config.icon}
            />
          )}
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
              priority
              className="object-cover object-center"
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
          {config.personLabel}
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
      {SceneBackdrop}
      {/* Soft accent glow — two-tone blend when a Premium secondary colour is set */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hasSecondary
            ? `radial-gradient(ellipse 60% 55% at 25% 35%, ${accent}22 0%, transparent 60%), radial-gradient(ellipse 60% 55% at 75% 75%, ${secondary}22 0%, transparent 60%)`
            : `radial-gradient(ellipse 70% 60% at 50% 60%, ${accent}22 0%, transparent 70%)`,
        }}
      />

      {/* ── Mobile layout ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-16 text-center md:hidden">
        {featuredItem && (
          config.useTilt ? (
            <BookCoverTilt
              href={buyHref}
              title={featuredItem.title}
              coverImageUrl={featuredItem.coverImageUrl}
              caption={featuredItem.caption}
              width={160}
              height={240}
            />
          ) : (
            <FlatCoverCard
              href={buyHref}
              title={featuredItem.title}
              coverImageUrl={featuredItem.coverImageUrl}
              caption={featuredItem.caption}
              width={300}
              height={169}
              icon={config.icon}
            />
          )
        )}
        <div className="flex flex-col items-center gap-4 max-w-sm">
          {eyebrowText && (
            <p className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: accent }}>
              {eyebrowText}
            </p>
          )}
          <h1 className="text-4xl font-bold text-white leading-tight author-font-heading">{authorName}</h1>
          {author.heroSubtitle && (
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.70)" }}>
              {author.heroSubtitle}
            </p>
          )}
          <div className="flex flex-col gap-3 w-full pt-2">
            <Link
              href={buyHref}
              className="w-full py-3 px-6 text-sm font-bold uppercase tracking-widest rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
              style={{ background: accent, color: readableTextOn(accent), boxShadow: `0 4px 24px ${accent}55` }}
            >
              {config.ctaLabel}
            </Link>
            <Link
              href="/about"
              className="w-full py-3 px-6 text-sm font-semibold uppercase tracking-widest rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5"
              style={{ border: `2px solid ${secondary}60`, color: "rgba(255,255,255,0.85)" }}
            >
              {config.personLabel}
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
          {eyebrowText && (
            <p className="text-xs font-bold uppercase tracking-[0.35em]" style={{ color: accent }}>
              {eyebrowText}
            </p>
          )}
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight author-font-heading">
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
                color: readableTextOn(accent),
                boxShadow: `0 4px 24px ${accent}55`,
              }}
            >
              {config.ctaLabel}
            </Link>
            <Link
              href="/about"
              className="w-full py-3 px-4 text-sm font-semibold uppercase tracking-widest rounded-xl text-center transition-all duration-300 hover:-translate-y-0.5"
              style={{ border: `2px solid ${secondary}60`, color: "rgba(255,255,255,0.85)" }}
            >
              {config.personLabel}
            </Link>
          </div>
          {/* Books-only: for Courses/Music this would just repeat eyebrowText above. */}
          {focus === "BOOKS" && featuredItem && (
            <p className="text-xs uppercase tracking-widest pt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              {featuredItem.title}
            </p>
          )}
        </div>

        {PhotoCol}
      </div>
    </section>
  );
}
