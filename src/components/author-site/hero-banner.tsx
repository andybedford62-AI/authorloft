// HeroBanner — cinematic editorial banner.
// • Accent-gradient background (no background photo).
// • Hero photo: object-contain so full person is always visible, slanted inner edge via
//   clip-path, multi-layer gradient fades edges into the background.
// • Book cover: large, slightly tilted, hover straightens + scales.
// • heroLayout ("author-right" | "author-left") flips the photo side.

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthorForTemplate, BookForTemplate } from "./templates/types";

interface HeroBannerProps {
  author: AuthorForTemplate;
  featuredBook: BookForTemplate | null;
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

export function HeroBanner({ author, featuredBook }: HeroBannerProps) {
  const accentColor = author.accentColor;
  const authorName  = author.displayName || author.name;
  const authorRight = (author.heroLayout ?? "author-right") === "author-right";
  const rgb         = hexToRgb(accentColor);
  const bookHref    = featuredBook ? `/books/${featuredBook.slug}` : "/books";
  const heroPhoto   = author.heroImageUrl;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: "400px",
        background: `linear-gradient(135deg, rgba(${rgb},1) 0%, rgba(${rgb},0.93) 55%, rgba(${rgb},0.80) 100%)`,
      }}
    >
      {/* ── Decorative blobs ─────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-[0.08] bg-white"
          style={{ [authorRight ? "left" : "right"]: "-60px" }}
        />
        <div
          className="absolute bottom-0 w-80 h-56 rounded-full blur-2xl opacity-[0.06] bg-white"
          style={{ [authorRight ? "left" : "right"]: "28%" }}
        />
      </div>

      {/* ── Hero photo — slanted inner edge, full person visible ─────── */}
      {heroPhoto && (
        <div
          className="absolute top-0 bottom-0 hidden sm:flex items-end"
          style={{
            [authorRight ? "right" : "left"]: 0,
            width: "46%",
            // Slanted inner edge: diagonal separator instead of a straight vertical line
            clipPath: authorRight
              ? "polygon(11% 0%, 100% 0%, 100% 100%, 0% 100%)"
              : "polygon(0% 0%, 89% 0%, 100% 100%, 0% 100%)",
          }}
        >
          {/* Image uses object-contain so the entire person is always visible */}
          <div className="absolute inset-0">
            <Image
              src={heroPhoto}
              alt={authorName}
              fill
              priority
              sizes="46vw"
              style={{ objectFit: "contain", objectPosition: "center bottom" }}
            />
          </div>

          {/* Inward gradient — photo dissolves into accent background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: authorRight
                ? `linear-gradient(to right,  rgba(${rgb},1) 0%, rgba(${rgb},0.65) 18%, rgba(${rgb},0.2) 45%, transparent 72%)`
                : `linear-gradient(to left,   rgba(${rgb},1) 0%, rgba(${rgb},0.65) 18%, rgba(${rgb},0.2) 45%, transparent 72%)`,
            }}
          />
          {/* Top feather */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(to bottom, rgba(${rgb},0.6) 0%, transparent 28%)` }}
          />
          {/* Bottom feather */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `linear-gradient(to top, rgba(${rgb},0.75) 0%, transparent 30%)` }}
          />

          {/* Meet the Author label */}
          <div
            className="relative z-10 pb-4 px-5 w-full"
            style={{ textAlign: authorRight ? "right" : "left" }}
          >
            <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/35 mb-0.5">
              Meet the Author
            </p>
            <p className="text-base font-extrabold text-white/70 leading-tight">{authorName}</p>
          </div>
        </div>
      )}

      {/* ── Foreground: book cover + text, centred in the non-photo zone ── */}
      <div
        className="relative z-10 flex flex-col justify-center min-h-[400px] px-8 sm:px-14 py-10"
        style={{ maxWidth: heroPhoto ? "57%" : "100%" }}
      >
        {/* Eyebrow */}
        <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/45 mb-5">
          {author.heroTitle || "Available Now"}
        </p>

        <div className="flex items-center gap-8 sm:gap-10">

          {/* ── Book cover — large, tilted, hover straightens + scales ── */}
          {featuredBook?.coverImageUrl ? (
            <Link href={bookHref} className="flex-shrink-0 group">
              <div
                className="relative shadow-2xl rounded-lg overflow-hidden transition-all duration-500 ease-out"
                style={{
                  width: "140px",
                  height: "210px",
                  transform: "rotate(-4deg) translateY(4px)",
                }}
                // Inline hover not possible with Tailwind — use group classes below
              >
                {/* Inner div carries the hover transforms */}
                <div className="absolute inset-0 transition-all duration-500 group-hover:scale-105 group-hover:[transform:rotate(4deg)_translateY(-4px)]">
                  <Image
                    src={featuredBook.coverImageUrl}
                    alt={featuredBook.title}
                    fill
                    className="object-cover"
                    sizes="140px"
                  />
                </div>
              </div>
            </Link>
          ) : (
            /* Reserved slot keeps layout stable when no cover is set */
            <div className="flex-shrink-0 hidden sm:block" style={{ width: "140px" }} />
          )}

          {/* ── Title + subtitle + buttons ── */}
          <div className="space-y-3 min-w-0 flex-1">
            {featuredBook && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-md line-clamp-3">
                {featuredBook.title}
              </h2>
            )}
            {author.heroSubtitle && (
              <p className="text-sm sm:text-base text-white/65 leading-relaxed max-w-xs line-clamp-2">
                {author.heroSubtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={bookHref}
                title="Shop for this book"
              >
                <Button
                  size="default"
                  className="bg-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{ color: accentColor }}
                  title="Shop for this book"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Shop Now
                </Button>
              </Link>
              <Link
                href="/about"
                title="Learn more about the author"
              >
                <Button
                  size="default"
                  variant="ghost"
                  className="text-white/85 hover:text-white hover:bg-white/15 border border-white/35 font-semibold"
                  title="Learn more about the author"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Mobile: byline since photo is hidden */}
            <p className="sm:hidden text-xs text-white/40 pt-1">by {authorName}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
