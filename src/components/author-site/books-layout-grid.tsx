"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatCents } from "@/lib/utils";
import type { RetailerLinkPublic, DirectSaleItemPublic } from "./book-card";

export interface GridBook {
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
  books:       GridBook[];
  accentColor: string;
}

function priceLabel(book: GridBook): string | null {
  const items = book.salesEnabled && book.directSalesEnabled ? (book.directSaleItems ?? []) : [];
  if (items.length > 0) {
    const lowest = Math.min(...items.map((i) => i.priceCents));
    return lowest === 0 ? "Free" : `From ${formatCents(lowest)}`;
  }
  if (book.priceCents > 0) return formatCents(book.priceCents);
  return null;
}

export function BooksLayoutGrid({ books, accentColor }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
      {books.map((book) => {
        const price = priceLabel(book);
        return (
          <Link
            key={book.id}
            href={`/books/${book.slug}`}
            className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white"
          >
            {/* Cover */}
            <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
              {book.coverImageUrl ? (
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="px-3 py-2.5 flex flex-col flex-1">
              <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                {book.title}
              </p>
              {/* Price or blank spacer for alignment */}
              <div className="mt-1 h-5 flex items-center">
                {price ? (
                  <span className="text-xs font-medium" style={{ color: accentColor }}>
                    {price}
                  </span>
                ) : (
                  <span className="invisible text-xs">—</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
