"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, BookOpen, ExternalLink } from "lucide-react";
import { formatCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getRetailer } from "@/lib/retailers";
import { CoverTilt } from "./cover-tilt";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RetailerLinkPublic = {
  id: string;
  retailer: string;
  label: string;
  url: string;
};

export type DirectSaleItemPublic = {
  id: string;
  format: string;
  label: string;
  description: string | null;
  priceCents: number;
};

interface BookCardProps {
  book: {
    id: string;
    title: string;
    slug: string;
    subtitle?: string | null;
    shortDescription?: string | null;
    coverImageUrl?: string | null;
    priceCents: number;
    seriesName?: string | null;
    seriesSlug?: string | null;
    externalBuyUrl?: string | null;   // legacy single-URL field
    caption?: string | null;          // e.g. "New Release!", "Coming Soon!"
    releaseDate?: Date | string | null;
    salesEnabled?: boolean;
    directSalesEnabled?: boolean;
    retailerLinks?: RetailerLinkPublic[];
    directSaleItems?: DirectSaleItemPublic[];
    saleInfo?: { discountCents: number; salePriceCents: number } | null;
  };
  accentColor: string;
  authorSlug: string;
  layout?: "card" | "list";
}

// ── Direct-sale buy buttons ───────────────────────────────────────────────────

function DirectBuyButtons({
  items,
  slug,
  size = "sm",
}: {
  items: DirectSaleItemPublic[];
  slug: string;
  size?: "xs" | "sm";
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/books/${slug}/buy?item=${item.id}`}
          title={item.description ?? undefined}
          className={`inline-flex items-center gap-1 rounded-md bg-[var(--accent)] text-white font-medium transition-opacity hover:opacity-90
            ${size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}
          `}
        >
          <ShoppingCart className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
          {item.label}
          {item.priceCents > 0 ? ` — ${formatCents(item.priceCents)}` : " — Free"}
        </Link>
      ))}
    </div>
  );
}

// ── Retailer button strip ─────────────────────────────────────────────────────

function RetailerButtons({ links, size = "sm" }: { links: RetailerLinkPublic[]; size?: "xs" | "sm" }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {links.map((link) => {
        const info = getRetailer(link.retailer);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            style={{ borderColor: info.color, color: info.color, backgroundColor: info.badgeBg }}
            className={`inline-flex items-center gap-1 rounded-md border font-medium transition-opacity hover:opacity-80
              ${size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"}
            `}
          >
            {link.label}
            <ExternalLink className={size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3"} />
          </a>
        );
      })}
    </div>
  );
}

// ── BookCard ──────────────────────────────────────────────────────────────────

export function BookCard({ book, accentColor, authorSlug, layout = "list" }: BookCardProps) {
  // Prefer multi-retailer links; fall back to the legacy single externalBuyUrl
  const hasRetailerLinks    = book.retailerLinks && book.retailerLinks.length > 0;
  // Per-format direct sale items (new system)
  const hasDirectSaleItems  = book.salesEnabled && book.directSalesEnabled &&
                              book.directSaleItems && book.directSaleItems.length > 0;
  // Legacy single-price direct buy button (shown only if no items exist)
  const showDirectBuyButton = !hasDirectSaleItems &&
                              book.salesEnabled && book.directSalesEnabled && book.priceCents > 0;

  // Smart price display: prefer cheapest direct-sale item, fall back to book-level price
  const activeSaleItems = hasDirectSaleItems ? book.directSaleItems! : [];
  const lowestSalePrice = activeSaleItems.length > 0
    ? Math.min(...activeSaleItems.map((i) => i.priceCents))
    : null;
  // Only show a price if we have direct sale items to back it up
  const priceLabel = lowestSalePrice !== null
    ? (lowestSalePrice === 0 ? "Free" : `From ${formatCents(lowestSalePrice)}`)
    : null;

  if (layout === "list") {
    return (
      <div
        className="flex flex-col sm:flex-row gap-6 py-8 border-b border-gray-100 last:border-0"
        style={{ "--accent": accentColor } as React.CSSProperties}
      >
        {/* Cover — clickable link to book detail */}
        <div className="flex-shrink-0">
          <Link href={`/books/${book.slug}`} className="block">
            <CoverTilt className="w-full sm:w-32 h-48 sm:h-44 bg-gray-100 rounded overflow-hidden relative shadow-sm">
              {book.coverImageUrl ? (
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-gray-300" />
                </div>
              )}
            </CoverTilt>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Caption badge */}
          {book.caption && (
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
              {book.caption}
            </p>
          )}

          {book.seriesName && (
            <p className="text-xs text-gray-500">
              From the series:{" "}
              <Link
                href={`/series/${book.seriesSlug}`}
                className="hover:text-[var(--accent)] transition-colors"
              >
                {book.seriesName}
              </Link>
            </p>
          )}

          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {book.title}
            {book.subtitle && (
              <span className="font-normal text-gray-600">: {book.subtitle}</span>
            )}
          </h3>

          {book.saleInfo ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ backgroundColor: accentColor + "20", color: accentColor }}
              >
                SALE
              </span>
              <span className="text-sm font-semibold" style={{ color: accentColor }}>
                {formatCents(book.saleInfo.salePriceCents)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatCents(book.priceCents)}
              </span>
            </div>
          ) : book.priceCents > 0 ? (
            <p className="text-sm font-semibold" style={{ color: accentColor }}>
              {formatCents(book.priceCents)}
            </p>
          ) : null}

          {/* Buy buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Per-format direct sale items */}
            {hasDirectSaleItems && (
              <DirectBuyButtons items={book.directSaleItems!} slug={book.slug} size="sm" />
            )}

            {/* Legacy single direct-buy button */}
            {showDirectBuyButton && (
              <Link href={`/books/${book.slug}/buy`}>
                <Button size="sm" variant="primary">
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                  Buy — {formatCents(book.priceCents)}
                </Button>
              </Link>
            )}

            {/* Retailer links */}
            {hasRetailerLinks ? (
              <RetailerButtons links={book.retailerLinks!} size="sm" />
            ) : !hasDirectSaleItems && !showDirectBuyButton && book.externalBuyUrl ? (
              <a href={book.externalBuyUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="primary">
                  <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                  Buy Now
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </a>
            ) : null}

            <Link href={`/books/${book.slug}`}>
              <Button size="sm" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Description */}
          {book.shortDescription && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {book.shortDescription}
            </p>
          )}

          {/* Release date */}
          {book.releaseDate && (
            <p className="text-xs text-gray-400">
              Released:{" "}
              {new Date(book.releaseDate).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Card layout
  return (
    <div
      className="group flex flex-col rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div className="h-56 bg-gray-100 relative overflow-hidden">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-300" />
          </div>
        )}
        {book.saleInfo && (
          <div
            className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm text-white"
            style={{ backgroundColor: accentColor }}
          >
            SALE
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        {book.caption && (
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
            {book.caption}
          </p>
        )}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{book.title}</h3>
        {book.shortDescription && (
          <p className="text-xs text-gray-500 line-clamp-2 flex-1">{book.shortDescription}</p>
        )}

        {/* Per-format direct sale items (card layout) */}
        {hasDirectSaleItems && (
          <DirectBuyButtons items={book.directSaleItems!} slug={book.slug} size="xs" />
        )}

        {/* Retailer links on card layout */}
        {hasRetailerLinks && (
          <RetailerButtons links={book.retailerLinks!} size="xs" />
        )}

        <div className="flex items-center justify-between mt-2">
          {book.saleInfo ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ backgroundColor: accentColor + "20", color: accentColor }}
              >
                SALE
              </span>
              <span className="text-sm font-medium" style={{ color: accentColor }}>
                {formatCents(book.saleInfo.salePriceCents)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatCents(book.priceCents)}
              </span>
            </div>
          ) : priceLabel ? (
            <span className="text-sm font-medium" style={{ color: accentColor }}>
              {priceLabel}
            </span>
          ) : (
            <span />
          )}
          <Link href={`/books/${book.slug}`}>
            <Button size="sm" variant="outline">
              Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
