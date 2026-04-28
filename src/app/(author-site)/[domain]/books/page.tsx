import { getAuthorByDomain, getAuthorBooks, getAuthorSeries, getAuthorGenres } from "@/lib/author-queries";
import { getActiveSaleDiscounts } from "@/lib/discount-queries";
import { BooksClient } from "./books-client";
import { PageBanner } from "@/components/author-site/page-banner";
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

  // Fetch active sale discounts for all books (one query)
  const bookPriceMap = new Map(books.map((b) => [b.id, b.priceCents]));
  const saleMap = await getActiveSaleDiscounts(author.id, bookPriceMap);

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
    releaseDate: b.releaseDate?.toISOString() ?? null,
    seriesId: b.seriesId,
    seriesName: b.series?.name ?? null,
    seriesSlug: b.series?.slug ?? null,
    genreIds: b.genres.map((g) => g.genreId),
    salesEnabled: author.plan?.salesEnabled ?? false,
    directSalesEnabled: b.directSalesEnabled,
    retailerLinks: b.retailerLinks ?? [],
    directSaleItems: (b as any).directSaleItems ?? [],
    caption: b.caption ?? null,
    saleInfo: saleMap.get(b.id) ?? null,
  }));

  const clientSeries = series.map((s) => ({ id: s.id, name: s.name, slug: s.slug }));
  const clientGenres = flatGenres.map((g) => ({ id: g.id, name: g.name }));

  const authorName = author.displayName || author.name;

  return (
    <div>

      <PageBanner
        label="Full Catalog"
        title="Books"
        subtitle={`Every title by ${authorName} — browse, filter, and find your next read.`}
        accentColor={author.accentColor}
      />

      <BooksClient
        books={clientBooks}
        series={clientSeries}
        genres={clientGenres}
        authorName={authorName}
        authorSlug={author.slug}
        accentColor={author.accentColor}
        layout={author.booksLayout ?? "list"}
        hideHeader
      />
    </div>
  );
}
