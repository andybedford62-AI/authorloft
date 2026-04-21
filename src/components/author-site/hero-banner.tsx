"use client";

// HeroBanner — two display modes controlled by heroLayout:
//
//  "author-left" | "author-right"  (default)
//    Split layout: large book cover + title + CTAs on one side,
//    author hero photo fading in from the other side.
//
//  "portrait"
//    Author-focus layout: hero photo fills the banner with soft mask-image
//    fading all edges into the accent-gradient background.
//    Author name + tagline overlaid at bottom; featured book cover floats top-right.

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
  const heroLayout  = author.heroLayout ?? "author-right";
  const authorRight = heroLayout === "author-right";
  const rgb         = hexToRgb(accentColor);
  const bookHref    = featuredBook ? `/books/${featuredBook.slug}` : "/books";
  const heroPhoto   = author.heroImageUrl;

  // ─────────────────────────────────────────────────────────────────────────
  // PORTRAIT MODE — hero photo fills the banner, author name overlaid
  // ─────────────────────────────────────────────────────────────────────────
  if (heroLayout === "portrait") {
    return (
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: "420px",
          background: `linear-gradient(135deg, rgba(${rgb},1) 0%, rgba(${rgb},0.9) 100%)`,
        }}
      >
        {/* Author photo — fills banner, all edges fade into background */}
        {heroPhoto && (
          <div
            className="absolute inset-0"
            style={{
              // Radial mask: centre is sharp, all edges dissolve into background
              WebkitMaskImage:
                "linear-gradient(to right,  transparent 0%, black 10%, black 90%, transparent 100%), " +
                "linear-gradient(to bottom, transparent 0%, black 8%,  black 80%, transparent 100%)",
              WebkitMaskComposite: "source-in",
              maskImage:
                "linear-gradient(to right,  transparent 0%, black 10%, black 90%, transparent 100%), " +
                "linear-gradient(to bottom, transparent 0%, black 8%,  black 80%, transparent 100%)",
              maskComposite: "intersect",
            }}
          >
            <Image
              src={heroPhoto}
              alt={authorName}
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          </div>
        )}

        {/* Bottom gradient for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(${rgb},0.92) 0%, rgba(${rgb},0.5) 35%, transparent 65%)`,
          }}
        />

        {/* Foreground: author name + tagline + buttons — bottom-left */}
        <div className="relative z-10 flex flex-col justify-end min-h-[420px] px-8 sm:px-14 pb-10 pt-10">
          <div className="max-w-lg space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/45">
              {author.heroTitle || "Meet the Author"}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
              {authorName}
            </h2>
            {(author.heroSubtitle || author.tagline) && (
              <p className="text-sm sm:text-base text-white/65 leading-relaxed line-clamp-2">
                {author.heroSubtitle || author.tagline}
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={bookHref} title="Browse books">
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
          </div>
        </div>

        {/* Featured book cover — floats top-right */}
        {featuredBook?.coverImageUrl && (
          <Link
            href={bookHref}
            className="absolute top-8 right-8 sm:top-10 sm:right-12 z-10 group hidden sm:block"
            title={featuredBook.title}
          >
            <div
              className="relative shadow-2xl rounded-lg overflow-hidden transition-all duration-400 ease-out"
              style={{ width: "100px", height: "150px", transform: "rotate(3deg)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) scale(1.07)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "rotate(3deg)";
              }}
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
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SPLIT MODE — book cover + text on one side, author photo on the other
  // ─────────────────────────────────────────────────────────────────────────

  // CSS mask: horizontal fade stronger on inner edge; vertical fade top + bottom
  const maskH = authorRight
    ? "linear-gradient(to right, transparent 0%, black 22%, black 88%, transparent 100%)"
    : "linear-gradient(to left,  transparent 0%, black 22%, black 88%, transparent 100%)";
  const maskV = "linear-gradient(to bottom, transparent 0%, black 10%, black 88%, transparent 100%)";

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: "400px",
        background: `linear-gradient(135deg, rgba(${rgb},1) 0%, rgba(${rgb},0.93) 55%, rgba(${rgb},0.80) 100%)`,
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.07] bg-white"
          style={{ [authorRight ? "left" : "right"]: "-60px" }}
        />
      </div>

      {/* Author photo — soft-masked, full person visible */}
      {heroPhoto && (
        <div
          className="absolute top-0 bottom-0 hidden sm:block"
          style={{
            [authorRight ? "right" : "left"]: 0,
            width: "46%",
            WebkitMaskImage: `${maskH}, ${maskV}`,
            WebkitMaskComposite: "source-in",
            maskImage: `${maskH}, ${maskV}`,
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

      {/* Meet the Author label */}
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

      {/* Foreground: eyebrow + book cover + text */}
      <div
        className="relative z-10 flex flex-col justify-center min-h-[400px] px-8 sm:px-14 py-10"
        style={{ maxWidth: heroPhoto ? "62%" : "100%" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-white/45 mb-5">
          {author.heroTitle || "Available Now"}
        </p>

        <div className="flex items-center gap-8 sm:gap-10">

          {/* Large book cover — tilted, hover straightens */}
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
                <Image src={featuredBook.coverImageUrl} alt={featuredBook.title} fill className="object-cover" sizes="140px" />
              </div>
            </Link>
          ) : (
            <div className="flex-shrink-0 hidden sm:block" style={{ width: "140px" }} />
          )}

          {/* Title + subtitle + buttons */}
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
            <p className="sm:hidden text-xs text-white/40 pt-1">by {authorName}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
