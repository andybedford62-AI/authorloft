// HeroBanner — cinematic banner: accent-gradient background, author portrait fades in from one
// side, featured book cover + CTAs on the other. No background photo — always uses accent colour.
// Layout direction controlled by author.heroLayout ("author-left" | "author-right").

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
  const accentColor  = author.accentColor;
  const authorName   = author.displayName || author.name;
  const authorRight  = (author.heroLayout ?? "author-right") === "author-right";
  const rgb          = hexToRgb(accentColor);
  const bookHref     = featuredBook ? `/books/${featuredBook.slug}` : "/books";
  const hasPhoto     = Boolean(author.profileImageUrl);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: "440px",
        background: `linear-gradient(135deg, rgba(${rgb},1) 0%, rgba(${rgb},0.92) 55%, rgba(${rgb},0.78) 100%)`,
      }}
    >
      {/* ── Subtle decorative blobs ────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-10 bg-white"
          style={{ [authorRight ? "left" : "right"]: "-40px" }}
        />
        <div
          className="absolute bottom-0 w-72 h-52 rounded-full blur-2xl opacity-[0.07] bg-white"
          style={{ [authorRight ? "left" : "right"]: "30%" }}
        />
      </div>

      {/* ── Author photo — absolute, covers one side, fades inward ───── */}
      {hasPhoto && (
        <div
          className="absolute top-0 bottom-0 hidden sm:block"
          style={{ [authorRight ? "right" : "left"]: 0, width: "45%" }}
        >
          <Image
            src={author.profileImageUrl!}
            alt={authorName}
            fill
            priority
            className="object-cover object-top"
            sizes="45vw"
          />

          {/* Inward gradient — photo dissolves into the background colour */}
          <div
            className="absolute inset-0"
            style={{
              background: authorRight
                ? `linear-gradient(to right, rgba(${rgb},1) 0%, rgba(${rgb},0.6) 22%, rgba(${rgb},0.18) 50%, transparent 78%)`
                : `linear-gradient(to left,  rgba(${rgb},1) 0%, rgba(${rgb},0.6) 22%, rgba(${rgb},0.18) 50%, transparent 78%)`,
            }}
          />

          {/* Top + bottom feather */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(${rgb},0.4) 0%, transparent 22%, transparent 68%, rgba(${rgb},0.75) 100%)`,
            }}
          />

          {/* "Meet the Author" label pinned to bottom of photo */}
          <p
            className="absolute bottom-5 text-white drop-shadow-lg leading-none z-10"
            style={{ [authorRight ? "right" : "left"]: "18px", textAlign: authorRight ? "right" : "left" }}
          >
            <span className="block text-[9px] uppercase tracking-[0.3em] font-bold text-white/35 mb-1">
              Meet the Author
            </span>
            <span className="text-base font-extrabold text-white/75">{authorName}</span>
          </p>
        </div>
      )}

      {/* ── Foreground content — pushed to the side opposite the photo ── */}
      <div className="relative z-10 flex items-center w-full min-h-[440px] px-8 sm:px-14 py-10">
        <div
          className={`flex items-center gap-6 sm:gap-8 w-full ${
            hasPhoto
              ? authorRight
                ? "mr-auto sm:max-w-[52%]"
                : "ml-auto sm:max-w-[52%]"
              : "mx-auto max-w-2xl"
          }`}
        >

          {/* Book cover */}
          {featuredBook?.coverImageUrl && (
            <Link href={bookHref} className="flex-shrink-0 group hidden xs:block">
              <div
                className="relative shadow-2xl rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:-rotate-1"
                style={{ width: "115px", height: "172px" }}
              >
                <Image
                  src={featuredBook.coverImageUrl}
                  alt={featuredBook.title}
                  fill
                  className="object-cover"
                  sizes="115px"
                />
              </div>
            </Link>
          )}

          {/* Text + buttons */}
          <div className="space-y-3 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
              {author.heroTitle || "Available Now"}
            </p>

            {/* Mobile-only book cover (photo col hidden, show small cover inline) */}
            {featuredBook?.coverImageUrl && (
              <Link href={bookHref} className="block sm:hidden mb-2">
                <div className="relative shadow-xl rounded overflow-hidden" style={{ width: "80px", height: "120px" }}>
                  <Image src={featuredBook.coverImageUrl} alt={featuredBook.title} fill className="object-cover" sizes="80px" />
                </div>
              </Link>
            )}

            {featuredBook && (
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow line-clamp-3">
                {featuredBook.title}
              </h2>
            )}
            {author.heroSubtitle && (
              <p className="text-sm text-white/65 leading-relaxed max-w-xs line-clamp-2">
                {author.heroSubtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={bookHref}>
                <Button
                  size="sm"
                  className="bg-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{ color: accentColor }}
                >
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/15 border border-white/30"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Mobile: author name since photo is hidden */}
            <p className="sm:hidden text-xs text-white/40 pt-1">by {authorName}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
