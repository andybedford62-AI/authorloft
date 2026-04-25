"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatCents } from "@/lib/utils";
import type { DirectSaleItemPublic } from "./book-card";

export interface ShelfBook {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  priceCents: number;
  salesEnabled: boolean;
  directSalesEnabled?: boolean;
  directSaleItems?: DirectSaleItemPublic[];
}

interface Props {
  books:       ShelfBook[];
  accentColor: string;
}

const SHELF_SIZE = 5; // books per shelf row on desktop

function priceLabel(book: ShelfBook): string | null {
  const items = book.salesEnabled && book.directSalesEnabled ? (book.directSaleItems ?? []) : [];
  if (items.length > 0) {
    const lowest = Math.min(...items.map((i) => i.priceCents));
    return lowest === 0 ? "Free" : `From ${formatCents(lowest)}`;
  }
  if (book.priceCents > 0) return formatCents(book.priceCents);
  return null;
}

// ── Single book spine on the shelf ────────────────────────────────────────────

function ShelfBook({ book, accentColor }: { book: ShelfBook; accentColor: string }) {
  const [hovered, setHovered] = useState(false);
  const price = priceLabel(book);

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <div
        className="relative w-full overflow-hidden rounded-t shadow-md group-hover:shadow-xl transition-all duration-200"
        style={{ aspectRatio: "2/3", transform: hovered ? "translateY(-6px)" : "none", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}
      >
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold text-center p-1 leading-tight"
            style={{ backgroundColor: accentColor }}
          >
            <BookOpen className="h-6 w-6 opacity-60" />
          </div>
        )}
      </div>

      {/* Title + price below cover */}
      <div className="w-full pt-1.5 pb-0.5 text-center min-h-[2.5rem] flex flex-col items-center">
        <p className="text-xs font-medium text-gray-800 leading-tight line-clamp-1 px-0.5 group-hover:text-[var(--accent)] transition-colors">
          {book.title}
        </p>
        <div className="h-4 flex items-center justify-center mt-0.5">
          {price ? (
            <span className="text-[10px] font-semibold" style={{ color: accentColor }}>{price}</span>
          ) : (
            <span className="invisible text-[10px]">—</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Wood shelf bar ─────────────────────────────────────────────────────────────

function ShelfBar() {
  return (
    <div className="w-full relative mt-0.5 mb-6">
      {/* Top highlight */}
      <div className="w-full h-1 rounded-t" style={{ background: "#e8b87a" }} />
      {/* Main shelf face */}
      <div
        className="w-full"
        style={{
          height: 14,
          background: "linear-gradient(180deg, #c8965a 0%, #a3693a 60%, #8a5530 100%)",
        }}
      />
      {/* Bottom shadow edge */}
      <div
        className="w-full rounded-b"
        style={{
          height: 6,
          background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function BooksLayoutShelf({ books, accentColor }: Props) {
  // Chunk into rows of SHELF_SIZE
  const chunks: ShelfBook[][] = [];
  for (let i = 0; i < books.length; i += SHELF_SIZE) {
    chunks.push(books.slice(i, i + SHELF_SIZE));
  }

  return (
    <div
      className="bg-[#faf6f0] rounded-2xl border border-[#e8ddd0] px-4 sm:px-8 pt-6 pb-2"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      {chunks.map((chunk, ci) => (
        <div key={ci}>
          {/* Books in this row */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
            {chunk.map((book) => (
              <ShelfBook key={book.id} book={book} accentColor={accentColor} />
            ))}
            {/* Fill empty slots so shelf bar is full width */}
            {Array.from({ length: SHELF_SIZE - chunk.length }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
          </div>
          <ShelfBar />
        </div>
      ))}
    </div>
  );
}
