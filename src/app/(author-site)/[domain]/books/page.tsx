import { BookOpen } from "lucide-react";
import { getAuthorByDomain, getAuthorBooks, getAuthorSeries, getAuthorGenres } from "@/lib/author-queries";
import { BooksClient } from "./books-client";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const authorName = author.displayName || author.name;
  return {
    title: "Books",
    description: `Browse all books by ${authorName} — explore the full catalog of novels, stories, and more.`,
    openGraph: {
      title: `Books by ${authorName}`,
      description: `The complete book catalog for ${authorName}.`,
    },
  };
}

export default async function BooksPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const [books, series, genreTree] = await Promise.all([
    getAuthorBooks(author.id),
    getAuthorSeries(author.id),
    getAuthorGenres(author.id),
  ]);

  const flatGenres = genreTree.flatMap((g) => [g, ...g.children]);

  // Simplify books for client component
  const clientBooks = books.map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    subtitle: b.subtitle,
    shortDescription: b.shortDescription,
    coverImageUrl: b.coverImageUrl,
    priceCents: b.priceCents,
    isFeatured: b.isFeatured,
    externalBuyUrl: b.externalBuyUrl,
    seriesId: b.seriesId,
    seriesName: b.series?.name ?? null,
    seriesSlug: b.series?.slug ?? null,
    genreIds: b.genres.map((g) => g.genreId),
    salesEnabled: author.plan?.salesEnabled ?? false,
    directSalesEnabled: b.directSalesEnabled,
    retailerLinks: b.retailerLinks ?? [],
    directSaleItems: (b as any).directSaleItems ?? [],
  }));

  const clientSeries = series.map((s) => ({ id: s.id, name: s.name, slug: s.slug }));
  const clientGenres = flatGenres.map((g) => ({ id: g.id, name: g.name }));

  const authorName = author.displayName || author.name;

  return (
    <div style={{ "--accent": author.accentColor } as React.CSSProperties}>

      {/* ── Page Banner ──────────────────────────────────────────────────── */}
      <section className="w-full py-12 px-4" style={{ backgroundColor: author.accentColor }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6 text-white/70" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
              Full Catalog
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Books</h1>
          <p className="text-white/75 mt-2 max-w-xl">
            Every title by {authorName} — browse, filter, and find your next read.
          </p>
        </div>
      </section>

      <BooksClient
        books={clientBooks}
        series={clientSeries}
        genres={clientGenres}
        authorName={authorName}
        authorSlug={author.slug}
        accentColor={author.accentColor}
        hideHeader
      />
    </div>
  );
}
