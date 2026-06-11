import { prisma } from "@/lib/db";

export type MediaKitData = {
  authorName: string;
  pressTitle: string | null;
  pressBio: string | null;
  pressContact: string | null;
  profileImageUrl: string | null;
  siteUrl: string;
  stats: {
    publishedBooks: number;
    newsletterSubscribers: number;
    avgRating: number | null; // 1-5, rounded to 1 decimal
    totalReviews: number;
    totalSales: number; // count of completed order items across this author's books
    topGenres: string[]; // up to 3, by book count
  };
  topBooks: { title: string; coverImageUrl: string | null }[]; // up to 6 published books for cover strip
};

/**
 * Aggregates an author's public-facing stats for the downloadable Media Kit
 * PDF — pulled from existing tables (no new schema). Designed to run quickly
 * with a handful of parallel queries.
 */
export async function getMediaKitData(authorId: string): Promise<MediaKitData> {
  const author = await prisma.author.findUniqueOrThrow({
    where: { id: authorId },
    select: {
      name: true, displayName: true, slug: true, customDomain: true,
      pressTitle: true, pressBio: true, pressContact: true, contactEmail: true,
      profileImageUrl: true,
    },
  });

  const [publishedBooks, subscriberCount, ratingAgg, reviewCount, genreCounts, books] = await Promise.all([
    prisma.book.count({ where: { authorId, isPublished: true } }),
    prisma.subscriber.count({ where: { authorId, isConfirmed: true } }),
    prisma.bookFeedback.aggregate({
      where: { book: { authorId }, status: "APPROVED" },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.bookReview.count({ where: { book: { authorId } } }),
    prisma.bookGenre.groupBy({
      by: ["genreId"],
      where: { book: { authorId, isPublished: true } },
      _count: { genreId: true },
      orderBy: { _count: { genreId: "desc" } },
      take: 3,
    }),
    prisma.book.findMany({
      where: { authorId, isPublished: true },
      select: { title: true, coverImageUrl: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
    }),
  ]);

  // Resolve genre names for the top genre IDs
  const genreIds = genreCounts.map((g) => g.genreId);
  const genres = genreIds.length
    ? await prisma.genre.findMany({ where: { id: { in: genreIds } }, select: { id: true, name: true } })
    : [];
  const genreNameById = new Map(genres.map((g) => [g.id, g.name]));
  const topGenres = genreCounts.map((g) => genreNameById.get(g.genreId)).filter((n): n is string => !!n);

  // Total sales: count of order items for this author's books on completed orders
  const totalSales = await prisma.orderItem.count({
    where: { book: { authorId }, order: { status: "COMPLETED" } },
  });

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const siteUrl = author.customDomain ? `https://${author.customDomain}` : `https://${author.slug}.${platformDomain}`;

  return {
    authorName: author.displayName || author.name,
    pressTitle: author.pressTitle,
    pressBio: author.pressBio,
    pressContact: author.pressContact || author.contactEmail,
    profileImageUrl: author.profileImageUrl,
    siteUrl,
    stats: {
      publishedBooks,
      newsletterSubscribers: subscriberCount,
      avgRating: ratingAgg._count.rating > 0 && ratingAgg._avg.rating != null
        ? Math.round(ratingAgg._avg.rating * 10) / 10
        : null,
      totalReviews: reviewCount + ratingAgg._count.rating,
      totalSales,
      topGenres,
    },
    topBooks: books,
  };
}
