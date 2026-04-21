// HeroBanner — cinematic two-zone banner.
// Background: always the accent-colour gradient.
// Right (or left): dedicated hero photo (heroImageUrl) dissolves into the gradient.
// Left (or right): large featured book cover + title + CTAs.
// heroLayout ("author-right" | "author-left") controls which side the photo appears.

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
  const heroPhoto   = author.heroImageUrl; // dedicated hero panel image

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: "380px",
        background: `linear-gradient(135deg, rgba(${rgb},1) 0%, rgba(${rgb},0.92) 55%, rgba(${rgb},0.78) 100%)`,
      }}
    >
      {/* ── Decorative blobs ─────────────────────────────────────────── */}
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

      {/* ── Hero photo — absolute on one side, dissolves into gradient ── */}
      {heroPhoto && (
        <div
          className="absolute top-0 bottom-0 hidden sm:block"
          style={{ [authorRight ? "right" : "left"]: 0, width: "44%" }}
        >
          <Image
            src={heroPhoto}
            alt={authorName}
            fill
            priority
            className="object-cover object-top"
            sizes="44vw"
          />
          {/* Inward fade — photo melts into background */}
          <div
            className="absolute inset-0"
            style={{
              background: authorRight
                ? `linear-gradient(to right, rgba(${rgb},1) 0%, rgba(${rgb},0.55) 20%, rgba(${rgb},0.15) 48%, transparent 75%)`
                : `linear-gradient(to left,  rgba(${rgb},1) 0%, rgba(${rgb},0.55) 20%, rgba(${rgb},0.15) 48%, transparent 75%)`,
            }}
          />
          {/* Top + bottom feather */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, rgba(${rgb},0.45) 0%, transparent 20%, transparent 65%, rgba(${rgb},0.85) 100%)`,
            }}
          />
          {/* Meet the Author label */}
          <div
            className="absolute bottom-4 z-10 text-white drop-shadow-lg"
            style={{ [authorRight ? "right" : "left"]: "18px", textAlign: authorRight ? "right" : "left" }}
          >
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/35 mb-0.5">
              Meet the Author
            </p>
            <p className="text-base font-extrabold text-white/75 leading-tight">{authorName}</p>
          </div>
        </div>
      )}

      {/* ── Foreground: eyebrow + book cover + text ───────────────────── */}
      <div className="relative z-10 flex flex-col min-h-[380px]">

        {/* Eyebrow — top of banner */}
        <div className="pt-7 pb-1 px-8 sm:px-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45">
            {author.heroTitle || "Available Now"}
          </p>
        </div>

        {/* Main row */}
        <div
          className="flex-1 flex items-center gap-7 sm:gap-10 px-8 sm:px-14 py-6"
          style={heroPhoto ? { maxWidth: "58%" } : {}}
        >
          {/* ── Large book cover ── */}
          {featuredBook?.coverImageUrl ? (
            <Link href={bookHref} className="flex-shrink-0 group">
              <div
                className="relative shadow-2xl rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:-rotate-1"
                style={{ width: "130px", height: "195px" }}
              >
                <Image
                  src={featuredBook.coverImageUrl}
                  alt={featuredBook.title}
                  fill
                  className="object-cover"
                  sizes="130px"
                />
              </div>
            </Link>
          ) : (
            /* No cover yet — empty reserved slot so layout stays consistent */
            <div className="flex-shrink-0 hidden sm:block" style={{ width: "130px" }} />
          )}

          {/* ── Title + subtitle + buttons ── */}
          <div className="space-y-3 min-w-0">
            {featuredBook && (
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow line-clamp-3">
                {featuredBook.title}
              </h2>
            )}
            {author.heroSubtitle && (
              <p className="text-sm text-white/60 leading-relaxed max-w-xs line-clamp-2">
                {author.heroSubtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-1">
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

            {/* Mobile: author name (hero photo hidden on mobile) */}
            <p className="sm:hidden text-xs text-white/40 pt-1">by {authorName}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
