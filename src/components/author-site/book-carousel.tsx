"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, BookOpen, X,
  ShoppingCart, ExternalLink, Eye,
} from "lucide-react";
import { formatCents } from "@/lib/utils";
import { getRetailer } from "@/lib/retailers";
import { CoverTilt } from "./cover-tilt";
import type { BookForTemplate } from "./templates/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type BookWithSales = BookForTemplate & { salesEnabled: boolean };

// ── Quick View Modal ──────────────────────────────────────────────────────────

function QuickViewModal({
  book,
  accentColor,
  onClose,
}: {
  book: BookWithSales;
  accentColor: string;
  onClose: () => void;
}) {
  const hasRetailerLinks   = (book.retailerLinks?.length ?? 0) > 0;
  const hasDirectSaleItems = book.salesEnabled && book.directSalesEnabled &&
                             (book.directSaleItems?.length ?? 0) > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ "--accent": accentColor } as React.CSSProperties}
      >
        <div className="flex">
          {/* Cover */}
          <div className="relative w-36 flex-shrink-0 bg-gray-100 self-stretch">
            {book.coverImageUrl ? (
              <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full min-h-[220px] flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-gray-300" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5 space-y-3 overflow-y-auto max-h-[85vh]">
            {/* Close */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Badge + series */}
            <div className="space-y-0.5">
              {book.caption && (
                <p className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: accentColor }}>
                  {book.caption}
                </p>
              )}
              {book.series && (
                <p className="text-xs text-gray-400">{book.series.name}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{book.title}</h3>
              {book.subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{book.subtitle}</p>
              )}
            </div>

            {/* Description */}
            {book.shortDescription && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">
                {book.shortDescription}
              </p>
            )}

            {/* Buy options */}
            <div className="space-y-2 pt-1">
              {hasDirectSaleItems && (
                <div className="flex flex-wrap gap-1.5">
                  {book.directSaleItems!.map((item) => (
                    <Link
                      key={item.id}
                      href={`/books/${book.slug}/buy?item=${item.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: accentColor }}
                    >
                      <ShoppingCart className="h-3 w-3" />
                      {item.label} — {item.priceCents > 0 ? formatCents(item.priceCents) : "Free"}
                    </Link>
                  ))}
                </div>
              )}

              {hasRetailerLinks && (
                <div className="flex flex-wrap gap-1.5">
                  {book.retailerLinks!.map((link) => {
                    const info = getRetailer(link.retailer);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          borderColor: info.color,
                          color: info.color,
                          backgroundColor: info.badgeBg,
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border text-xs font-medium transition-opacity hover:opacity-80"
                      >
                        {link.label}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    );
                  })}
                </div>
              )}

              {!hasRetailerLinks && !hasDirectSaleItems && book.externalBuyUrl && (
                <a
                  href={book.externalBuyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: accentColor }}
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Buy Now
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <Link
                href={`/books/${book.slug}`}
                className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Carousel ──────────────────────────────────────────────────────────────────

export function BookCarousel({
  books,
  accentColor,
  salesEnabled,
}: {
  books: BookForTemplate[];
  accentColor: string;
  salesEnabled: boolean;
}) {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const [quickView, setQuickView] = useState<BookForTemplate | null>(null);

  const scroll = useCallback((dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  }, []);

  return (
    <>
      <div className="relative px-6">
        {/* Prev */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-8 z-10 bg-white border border-gray-200 shadow-md rounded-full p-2 hover:shadow-lg transition-shadow"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        {/* Track */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
        >
          {books.map((book) => (
            <div
              key={book.id}
              className="flex-shrink-0 w-44 group"
              style={{ scrollSnapAlign: "start" }}
            >
              {/* Cover — consistent 3:4 ratio */}
              <Link href={`/books/${book.slug}`} className="block mb-2.5">
                <CoverTilt
                  className="relative w-full rounded-xl overflow-hidden shadow-sm bg-gray-100"
                  style={{ aspectRatio: "3/4" }}
                >
                  {book.coverImageUrl ? (
                    <Image
                      src={book.coverImageUrl}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-300" />
                    </div>
                  )}

                  {/* Caption badge */}
                  {book.caption && (
                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide text-white shadow"
                      style={{ backgroundColor: accentColor }}
                    >
                      {book.caption}
                    </span>
                  )}
                </CoverTilt>
              </Link>

              {/* Series label */}
              {book.series && (
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5 truncate">
                  {book.series.name}
                </p>
              )}

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2">
                {book.title}
              </h3>

              {/* Quick View */}
              <button
                onClick={() => setQuickView(book)}
                className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
                style={{ ["--accent" as string]: accentColor }}
              >
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </button>
            </div>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-8 z-10 bg-white border border-gray-200 shadow-md rounded-full p-2 hover:shadow-lg transition-shadow"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Modal */}
      {quickView && (
        <QuickViewModal
          book={{ ...quickView, salesEnabled }}
          accentColor={accentColor}
          onClose={() => setQuickView(null)}
        />
      )}
    </>
  );
}
