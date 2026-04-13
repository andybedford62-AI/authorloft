import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/author-site/book-card";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const series = await prisma.series.findFirst({
    where: { authorId: author.id, slug },
    select: { name: true, description: true },
  });
  if (!series) return { title: "Series Not Found" };
  const authorName = author.displayName || author.name;
  return {
    title: series.name,
    description: series.description || `Books in the ${series.name} series by ${authorName}.`,
  };
}

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  const series = await prisma.series.findFirst({
    where: { authorId: author.id, slug },
    include: {
      books: {
        where: { isPublished: true },
        include: {
          retailerLinks: {
            where: { isActive: true },
            select: { id: true, retailer: true, label: true, url: true },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
          directSaleItems: {
            where: { isActive: true },
            select: { id: true, format: true, label: true, description: true, priceCents: true },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!series) notFound();

  const salesEnabled = author.plan?.salesEnabled ?? false;

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── Page Banner ──────────────────────────────────────────────────── */}
      <section className="w-full py-12 px-4" style={{ backgroundColor: accentColor }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Library className="h-6 w-6 text-white/70" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
              Series
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{series.name}</h1>
          {series.description && (
            <p className="text-white/75 mt-2 max-w-xl">{series.description}</p>
          )}
          <p className="text-white/60 text-sm mt-3">
            {series.books.length} book{series.books.length !== 1 ? "s" : ""} in this series
          </p>
        </div>
      </section>

      {/* ── Books ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {series.books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">No books in this series yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {series.books.map((book, index) => (
              <div key={book.id} className="relative">
                {/* Series position badge */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0 hidden sm:flex
                             items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold
                             flex-shrink-0 z-10"
                  style={{ backgroundColor: accentColor, opacity: 0.8 }}
                >
                  {index + 1}
                </div>
                <div className="sm:pl-10">
                  <BookCard
                    book={{
                      id: book.id,
                      title: book.title,
                      slug: book.slug,
                      subtitle: book.subtitle,
                      shortDescription: book.shortDescription,
                      coverImageUrl: book.coverImageUrl,
                      priceCents: book.priceCents,
                      externalBuyUrl: book.externalBuyUrl,
                      salesEnabled,
                      directSalesEnabled: book.directSalesEnabled,
                      retailerLinks: book.retailerLinks,
                      directSaleItems: book.directSaleItems,
                    }}
                    accentColor={accentColor}
                    authorSlug={author.slug}
                    layout="list"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Back link ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 pt-2 border-t border-gray-100">
        <Link href="/books">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to all books
          </Button>
        </Link>
      </section>
    </div>
  );
}
