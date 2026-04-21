"use client";

// HeroBanner — cinematic editorial banner.
// • Accent-gradient background (no background photo).
// • Hero photo: CSS mask-image creates seamless all-edge soft fade into background.
//   No hard clip-path — pure alpha masking for seamless blending.
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

  // CSS mask gradients — fade all four edges of the photo seamlessly into background.
  // Horizontal: stronger fade on the inner edge (where photo meets content), lighter on outer edge.
  // Vertical: gentle fade top and bottom.
  const maskHorizontal = authorRight
    ? "linear-gradient(to right, transparent 0%, black 22%, black 88%, transparent 100%)"
    : "linear-gradient(to left,  transparent 0%, black 22%, black 88%, transparent 100%)";
  const maskVertical = "linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)";

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
          className="absolute -top-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.07] bg-white"
          style={{ [authorRight ? "left" : "right"]: "-60px" }}
        />
        <div
          className="absolute bottom-0 w-80 h-52 rounded-full blur-2xl opacity-[0.05] bg-white"
          style={{ [authorRight ? "left" : "right"]: "25%" }}
        />
      </div>

      {/* ── Hero photo — soft-masked, full person visible ────────────── */}
      {heroPhoto && (
        <div
          className="absolute top-0 bottom-0 hidden sm:block"
          style={{
            [authorRight ? "right" : "left"]: 0,
            width: "46%",
            // CSS mask creates soft fade on ALL edges — no hard border anywhere
            WebkitMaskImage: `${maskHorizontal}, ${maskVertical}`,
            WebkitMaskComposite: "source-in",
            maskImage: `${maskHorizontal}, ${maskVertical}`,
            maskComposite: "intersect",
          }}
        >
          <Image
            src={heroPhoto}
            alt={authorName}
            fill
            priority
            sizes="46vw"
            style={{ objectFit: "contain", objectPosition: "center bottom" }}
          />
        </div>
      )}

      {/* Meet the Author label — separate from masked div so it stays crisp */}
      {heroPhoto && (
        <div
          className="absolute bottom-4 hidden sm:block z-10"
          style={{ [authorRight ? "right" : "left"]: "18px", textAlign: authorRight ? "right" : "left" }}
        >
          <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-white/35 mb-0.5">
            Meet the Author
          </p>
          <p className="text-base font-extrabold text-white/70 leading-tight drop-shadow">{authorName}</p>
        </div>
      )}

      {/* ── Foreground: book cover + text ────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col justify-center min-h-[400px] px-8 sm:px-14 py-10"
        style={{ maxWidth: heroPhoto ? "62%" : "100%" }}
      >
        {/* Eyebrow */}
        <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/45 mb-5">
          {author.heroTitle || "Available Now"}
        </p>

        <div className="flex items-center gap-8 sm:gap-10">

          {/* ── Book cover: large, tilted, hover straightens + scales ─── */}
          {featuredBook?.coverImageUrl ? (
            <Link href={bookHref} className="flex-shrink-0 group">
              <div
                className="relative shadow-2xl rounded-lg overflow-hidden"
                style={{ width: "140px", height: "210px", transform: "rotate(-4deg) translateY(4px)", transition: "transform 0.4s ease, box-shadow 0.4s ease" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) translateY(0px) scale(1.06)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 25px 50px rgba(0,0,0,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "rotate(-4deg) translateY(4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                }}
              >
                <Image
                  src={featuredBook.coverImageUrl}
                  alt={featuredBook.title}
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
            </Link>
          ) : (
            <div className="flex-shrink-0 hidden sm:block" style={{ width: "140px" }} />
          )}

          {/* ── Title + subtitle + buttons ── */}
          <div className="space-y-4 min-w-0 flex-1">
            {featuredBook && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight drop-shadow-md line-clamp-3">
                {featuredBook.title}
              </h2>
            )}
            {author.heroSubtitle && (
              <p className="text-sm sm:text-base text-white/65 leading-relaxed line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {author.heroSubtitle}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <Link href={bookHref} title="Buy or find this book online">
                <Button
                  size="lg"
                  className="bg-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 px-6"
                  style={{ color: accentColor }}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Shop Now
                </Button>
              </Link>
              <Link href="/about" title="Learn more about the author">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white/85 hover:text-white hover:bg-white/15 border border-white/35 font-semibold px-6"
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
