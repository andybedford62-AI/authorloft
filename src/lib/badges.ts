import { prisma } from "@/lib/db";

export type EarnedBadge = {
  key: string;
  label: string;
  description: string | null;
  icon: string;
  metric: string;
  threshold: number;
};

/** Raw metric values for one author, used to compare against BadgeDefinition thresholds. */
export type AuthorBadgeMetrics = {
  books: number;
  revenue: number; // cents, completed orders only
  reviews: number;
  subscribers: number;
  arcReviews: number;
  affiliateSales: number;
  formats: number; // distinct sale formats across the author's books
  bundles: number;
  courses: number;
  preorders: number;
};

export async function getAuthorBadgeMetrics(authorId: string): Promise<AuthorBadgeMetrics> {
  const [
    books,
    revenue,
    reviews,
    subscribers,
    arcReviews,
    affiliateSales,
    formatBooks,
    bundles,
    courses,
    preorders,
  ] = await Promise.all([
    prisma.book.count({ where: { authorId, isPublished: true } }),
    prisma.order.aggregate({ where: { authorId, status: "COMPLETED" }, _sum: { totalCents: true } }),
    prisma.bookReview.count({ where: { book: { authorId } } }),
    prisma.subscriber.count({ where: { authorId } }),
    prisma.arcReader.count({ where: { status: "REVIEWED", arcCopy: { book: { authorId } } } }),
    prisma.affiliateReferral.aggregate({ where: { book: { authorId } }, _sum: { saleCount: true } }),
    prisma.book.findMany({ where: { authorId }, select: { availableFormats: true } }),
    prisma.bundle.count({ where: { authorId, isPublished: true } }),
    prisma.course.count({ where: { authorId, kind: "COURSE", isPublished: true } }),
    prisma.preOrderSignup.count({ where: { authorId } }),
  ]);

  const distinctFormats = new Set(formatBooks.flatMap((b) => b.availableFormats));

  return {
    books,
    revenue: revenue._sum.totalCents ?? 0,
    reviews,
    subscribers,
    arcReviews,
    affiliateSales: affiliateSales._sum.saleCount ?? 0,
    formats: distinctFormats.size,
    bundles,
    courses,
    preorders,
  };
}

/**
 * Resolves earned badges for an author: for each active metric, the author gets
 * only the highest threshold they've cleared (no clutter from every lower tier).
 */
export async function getAuthorBadges(authorId: string): Promise<EarnedBadge[]> {
  const [metrics, definitions] = await Promise.all([
    getAuthorBadgeMetrics(authorId),
    prisma.badgeDefinition.findMany({ where: { isActive: true }, orderBy: { threshold: "asc" } }),
  ]);

  const byMetric = new Map<string, typeof definitions>();
  for (const def of definitions) {
    if (!byMetric.has(def.metric)) byMetric.set(def.metric, []);
    byMetric.get(def.metric)!.push(def);
  }

  const earned: EarnedBadge[] = [];
  for (const [metric, defs] of byMetric) {
    const value = (metrics as unknown as Record<string, number>)[metric];
    if (value === undefined) continue;
    const cleared = defs.filter((d) => value >= d.threshold);
    if (cleared.length === 0) continue;
    const best = cleared[cleared.length - 1]; // highest threshold cleared (defs sorted asc)
    earned.push({
      key: best.key,
      label: best.label,
      description: best.description,
      icon: best.icon,
      metric: best.metric,
      threshold: best.threshold,
    });
  }

  return earned;
}
