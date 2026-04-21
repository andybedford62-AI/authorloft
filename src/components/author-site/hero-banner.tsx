// HeroBanner — two-column editorial banner used by all homepage templates.
// Author portrait on one side, featured book + CTAs on the other.
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

// Hex → RGB helper for gradient blends
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

  return (
    <section
      className="relative overflow-hidden flex"
      style={{ minHeight: "460px" }}
    >
      {/* ── Background ──────────────────────────────────────────────────── */}
      {author.heroImageUrl ? (
        <>
          <Image
            src={author.heroImageUrl}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          {/* Dark tint so elements stay readable */}
          <div className="absolute inset-0 bg-black/50" />
        </>
      ) : (
        /* Accent gradient with subtle decoration */
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(${rgb},0.97) 0%, rgba(${rgb},0.82) 55%, rgba(${rgb},0.60) 100%)`,
            }}
          />
          {/* Decorative blobs */}
          <div
            className="absolute -top-24 w-80 h-80 rounded-full blur-3xl opacity-20 bg-white pointer-events-none"
            style={{ [authorRight ? "left" : "right"]: "-40px" }}
          />
          <div
            className="absolute bottom-0 w-64 h-64 rounded-full blur-2xl opacity-15 bg-white pointer-events-none"
            style={{ [authorRight ? "right" : "left"]: "15%" }}
          />
        </>
      )}

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div
        className={`relative z-10 flex w-full ${authorRight ? "flex-row" : "flex-row-reverse"}`}
        style={{ minHeight: "460px" }}
      >

        {/* ── Author photo column ─────────────────────────────────────── */}
        <div className="relative w-[40%] flex-shrink-0 hidden sm:block overflow-hidden">
          {author.profileImageUrl ? (
            <>
              <Image
                src={author.profileImageUrl}
                alt={authorName}
                fill
                className="object-cover object-top"
                sizes="40vw"
              />
              {/* Inward gradient blend — bleeds into content column */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: authorRight
                    ? `linear-gradient(to left, rgba(${rgb},0.85) 0%, rgba(${rgb},0.3) 30%, transparent 60%)`
                    : `linear-gradient(to right, rgba(${rgb},0.85) 0%, rgba(${rgb},0.3) 30%, transparent 60%)`,
                }}
              />
              {author.heroImageUrl && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: authorRight
                      ? "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 30%, transparent 60%)"
                      : "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 30%, transparent 60%)",
                  }}
                />
              )}
            </>
          ) : (
            /* No profile photo — fill with accent tint */
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(${rgb},0.3)` }} />
          )}

          {/* "Meet the Author" label pinned to bottom */}
          <div
            className={`absolute bottom-6 ${authorRight ? "right-5 text-right" : "left-5 text-left"} text-white drop-shadow-lg`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">
              Meet the Author
            </p>
            <p className="text-base sm:text-lg font-extrabold leading-tight">
              {authorName}
            </p>
          </div>
        </div>

        {/* ── Book + CTA column ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10 gap-5">

          {/* Eyebrow */}
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/55">
            {author.heroTitle || "Available Now"}
          </p>

          {/* Book cover + text row */}
          <div className={`flex items-center gap-6 sm:gap-8 ${authorRight ? "" : "flex-row-reverse"}`}>

            {/* Book cover */}
            {featuredBook?.coverImageUrl && (
              <Link href={bookHref} className="flex-shrink-0 group">
                <div
                  className="relative shadow-2xl rounded overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-1"
                  style={{ width: "100px", height: "150px" }}
                >
                  <Image
                    src={featuredBook.coverImageUrl}
                    alt={featuredBook.title}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              </Link>
            )}

            {/* Text + buttons */}
            <div className="space-y-3 min-w-0">
              {featuredBook && (
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow line-clamp-3">
                  {featuredBook.title}
                </h2>
              )}
              {author.heroSubtitle && (
                <p className="text-sm text-white/70 leading-relaxed max-w-xs line-clamp-2">
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
            </div>
          </div>

          {/* Mobile: author name (photo column hidden on mobile) */}
          <p className="sm:hidden text-xs text-white/50 mt-2">
            by {authorName}
          </p>
        </div>
      </div>
    </section>
  );
}
