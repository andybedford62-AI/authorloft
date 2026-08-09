import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1.0, lastModified: now },
    { url: `${BASE}/features`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE}/pricing`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${BASE}/bookstore`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${BASE}/faq`, changeFrequency: "monthly", priority: 0.6, lastModified: now },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.7, lastModified: now },
    { url: `${BASE}/news`, changeFrequency: "weekly", priority: 0.6, lastModified: now },
    { url: `${BASE}/guides`, changeFrequency: "weekly", priority: 0.7, lastModified: now },
    { url: `${BASE}/resources`, changeFrequency: "monthly", priority: 0.5, lastModified: now },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.4, lastModified: now },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
    { url: `${BASE}/gdpr`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
    { url: `${BASE}/us-privacy`, changeFrequency: "yearly", priority: 0.2, lastModified: now },
  ];

  const solutionPages: MetadataRoute.Sitemap = [
    "author-website-builder",
    "sell-books-directly",
    "book-marketing-platform",
    "author-newsletter-platform",
    "arc-management",
    "author-media-kit",
    "ai-tools-for-authors",
    "indie-author-bookstore",
    "book-pre-orders",
    "author-affiliate-program",
    "reader-analytics-for-authors",
  ].map((slug) => ({
    url: `${BASE}/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    lastModified: now,
  }));

  const comparisonPages: MetadataRoute.Sitemap = [
    "bookfunnel",
    "storyorigin",
    "tertulia",
    "quilltips",
  ].map((slug) => ({
    url: `${BASE}/compare/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: now,
  }));

  const [blogPosts, newsPosts, guides, genres, resourceDownloads] = await Promise.all([
    prisma.platformPost.findMany({
      where: { isPublished: true, isNews: { not: true } },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }).catch(() => []),
    prisma.platformPost.findMany({
      where: { isPublished: true, isNews: true },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }).catch(() => []),
    prisma.guide.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }).catch(() => []),
    prisma.genre.findMany({
      select: { slug: true },
    }).catch(() => []),
    prisma.resourceDownload.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { displayOrder: "asc" },
    }).catch(() => []),
  ]);

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((p: { slug: string; updatedAt: Date }) => ({
    url: `${BASE}/blog/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
    lastModified: p.updatedAt,
  }));

  const newsUrls: MetadataRoute.Sitemap = newsPosts.map((p: { slug: string; updatedAt: Date }) => ({
    url: `${BASE}/news/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
    lastModified: p.updatedAt,
  }));

  const guideUrls: MetadataRoute.Sitemap = guides.map((g: { slug: string; updatedAt: Date }) => ({
    url: `${BASE}/guides/${g.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
    lastModified: g.updatedAt,
  }));

  const genreUrls: MetadataRoute.Sitemap = genres.map((g: { slug: string }) => ({
    url: `${BASE}/bookstore/genre/${g.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
    lastModified: now,
  }));

  const resourceUrls: MetadataRoute.Sitemap = resourceDownloads.map((r: { slug: string; updatedAt: Date }) => ({
    url: `${BASE}/resources/${r.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
    lastModified: r.updatedAt,
  }));

  return [
    ...staticPages,
    ...solutionPages,
    ...comparisonPages,
    ...blogUrls,
    ...newsUrls,
    ...guideUrls,
    ...genreUrls,
    ...resourceUrls,
  ];
}
