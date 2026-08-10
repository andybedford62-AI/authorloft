import { getAuthorByDomain, getAuthorBooks, getAuthorSeries, getAuthorGenres } from "@/lib/author-queries";
import { getActiveSaleDiscounts } from "@/lib/discount-queries";
import { prisma } from "@/lib/db";
import { BooksBundlesTabs } from "@/components/author-site/books-bundles-tabs";
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

export default async function BooksPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { domain } = await params;
  const { tab } = await searchParams;
  const author = await getAuthorByDomain(domain);

  // Bundles tab: opt-in (navShowBundles defaults false, same as the old nav
  // link did), plan-gated, and only queried at all if both are true.
  const bundlesEligible = !!author.plan?.bundlesEnabled && !!author.navShowBundles;

  const [books, series, genreTree, bundles] = await Promise.all([
    getAuthorBooks(author.id),
    getAuthorSeries(author.id),
    getAuthorGenres(author.id),
    bundlesEligible
      ? prisma.bundle.findMany({
          where: { authorId: author.id, isPublished: true },
          include: {
            items: {
              include: {
                saleItem: {
                  include: { book: { select: { title: true, coverImageUrl: true } } },
                },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        })
      : Promise.resolve([]),
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
    isPreOrder: b.isPreOrder,
    saleInfo: saleMap.get(b.id) ?? null,
  }));

  const clientSeries = series.map((s) => ({ id: s.id, name: s.name, slug: s.slug }));
  const clientGenres = flatGenres.map((g) => ({ id: g.id, name: g.name }));

  const authorName = author.displayName || author.name;
  const showBundlesTab = bundlesEligible && bundles.length > 0;

  return (
    <div>

      <PageBanner
        label="Full Catalog"
        title="Books"
        subtitle={`Every title by ${authorName} — browse, filter, and find your next read.`}
        accentColor={author.accentColor}
      />

      <BooksBundlesTabs
        books={clientBooks}
        series={clientSeries}
        genres={clientGenres}
        authorName={authorName}
        authorSlug={author.slug}
        accentColor={author.accentColor}
        layout={author.booksLayout ?? "list"}
        bundles={bundles}
        showBundlesTab={showBundlesTab}
        initialTab={tab === "bundles" ? "bundles" : "books"}
      />
    </div>
  );
}
