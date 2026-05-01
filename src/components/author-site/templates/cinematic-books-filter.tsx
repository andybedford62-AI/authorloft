"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import type { BookForTemplate } from "./types";

interface Props {
  books: BookForTemplate[];
  accentColor: string;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CinematicBooksFilter({ books, accentColor }: Props) {
  const seriesNames = Array.from(
    new Set(books.map((b) => b.series?.name).filter(Boolean) as string[])
  );
  const hasStandalones = books.some((b) => !b.series);
  const filters = [
    "All",
    ...seriesNames,
    ...(hasStandalones && seriesNames.length > 0 ? ["Standalone"] : []),
  ];

  const [active, setActive] = useState("All");

  const visible = books.filter((b) => {
    if (active === "All") return true;
    if (active === "Standalone") return !b.series;
    return b.series?.name === active;
  });

  return (
    <div>
      {/* Filter pills */}
      {filters.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200"
              style={
                active === f
                  ? { background: accentColor, borderColor: accentColor, color: "#0A192F" }
                  : { background: "transparent", borderColor: accentColor + "55", color: "#FBF6E9" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Book grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {visible.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.slug}`}
            className="group flex flex-col gap-3"
          >
            <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-[#1E3A5F]"
              style={{ boxShadow: "8px 12px 20px rgba(0,0,0,0.5), 2px 4px 8px rgba(0,0,0,0.3)" }}
            >
              {book.coverImageUrl ? (
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-[#D4AF37]/40" />
                </div>
              )}
              {book.caption && (
                <span
                  className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-[#0A192F]"
                  style={{ background: accentColor }}
                >
                  {book.caption}
                </span>
              )}
            </div>
            {book.series && (
              <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: accentColor }}>
                {book.series.name}
              </p>
            )}
            <h3 className="text-sm font-semibold text-[#FBF6E9] leading-snug line-clamp-2 font-heading">
              {book.title}
            </h3>
            <p className="text-xs text-[#FBF6E9]/50 -mt-1">{formatPrice(book.priceCents)}</p>
          </Link>
        ))}

        {/* View all tile */}
        <Link
          href="/books"
          className="group flex flex-col items-center justify-center aspect-[2/3] rounded-sm border border-dashed transition-colors duration-200"
          style={{ borderColor: accentColor + "44" }}
        >
          <Plus className="w-8 h-8 mb-2 transition-colors" style={{ color: accentColor + "88" }} />
          <span className="text-xs font-semibold tracking-wide" style={{ color: accentColor + "88" }}>
            View all
          </span>
        </Link>
      </div>
    </div>
  );
}
