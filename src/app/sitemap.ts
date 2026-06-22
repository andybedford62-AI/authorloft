import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getBookstoreData } from "@/lib/bookstore";
import { COMPARISON_SLUGS } from "@/lib/comparison-data";
import { LANDING_PAGE_SLUGS } from "@/lib/landing-page-data";

export const dynamic = "force-dynamic";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published blog posts (exclude news — those live under /news)
  const blogPosts = await prisma.platformPost.findMany({
    where:   { isPublished: true, isNews: false },
    select:  { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  }).catch(() => []);

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url:             `${BASE}/blog/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }));

  // Fetch all published news posts
  const newsPosts = await prisma.platformPost.findMany({
    where:   { isPublished: true, isNews: true },
    select:  { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  }).catch(() => []);

  const newsEntries: MetadataRoute.Sitemap = newsPosts.map((p) => ({
    url:             `${BASE}/news/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }));

  // Guide (pillar) pages
  const guides = await prisma.guide.findMany({
    where:   { isPublished: true },
    select:  { slug: true, updatedAt: true },
  }).catch(() => []);

  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url:             `${BASE}/guides/${g.slug}`,
    lastModified:    g.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.8,
  }));

  // Resource download detail pages
  const resourceDownloads = await prisma.resourceDownload.findMany({
    where:   { isPublished: true },
    select:  { slug: true, updatedAt: true },
  }).catch(() => []);

  const resourceDownloadEntries: MetadataRoute.Sitemap = resourceDownloads.map((d) => ({
    url:             `${BASE}/resources/${d.slug}`,
    lastModified:    d.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.65,
  }));

  // Bookstore genre landing pages (only genres that actually have books)
  const { genres } = await getBookstoreData().catch(() => ({ genres: [] as { slug: string }[] }));
  const genreEntries: MetadataRoute.Sitemap = genres.map((g) => ({
    url:             `${BASE}/bookstore/genre/${g.slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.6,
  }));

  return [
    // Core pages - highest priority
    { url: `${BASE}/`,         lastModified: new Date(), changeFrequency: "weekly",   priority: 1.0 },
    { url: `${BASE}/features`, lastModified: new Date(), changeFrequency: "monthly",  priority: 0.9 },
    { url: `${BASE}/pricing`,  lastModified: new Date(), changeFrequency: "monthly",  priority: 0.9 },

    // Bookstore - high priority discovery catalog
    { url: `${BASE}/bookstore`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    ...genreEntries,

    // Comparison / "vs" landing pages (SEO + GEO)
    ...COMPARISON_SLUGS.map((slug) => ({
      url:             `${BASE}/compare/${slug}`,
      lastModified:    new Date(),
      changeFrequency: "monthly" as const,
      priority:        0.75,
    })),

    // Commercial landing pages (GEO Phase 2)
    ...LANDING_PAGE_SLUGS.map((slug) => ({
      url:             `${BASE}/${slug}`,
      lastModified:    new Date(),
      changeFrequency: "monthly" as const,
      priority:        0.8,
    })),

    // Blog - high priority for SEO
    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: "weekly",   priority: 0.85 },
    ...blogEntries,

    // News - company updates/announcements
    { url: `${BASE}/news`,     lastModified: new Date(), changeFrequency: "weekly",   priority: 0.8 },
    ...newsEntries,

    // Guides (pillar pages) - high priority for GEO
    { url: `${BASE}/guides`,    lastModified: new Date(), changeFrequency: "weekly",   priority: 0.85 },
    ...guideEntries,

    // Resources - medium priority
    { url: `${BASE}/resources`, lastModified: new Date(), changeFrequency: "monthly",  priority: 0.7 },
    ...resourceDownloadEntries,

    // FAQ - medium priority (carries FAQ structured data)
    { url: `${BASE}/faq`,       lastModified: new Date(), changeFrequency: "monthly",  priority: 0.7 },

    // Contact - medium priority
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: "yearly",   priority: 0.6 },

    // Legal pages - lower priority
    { url: `${BASE}/privacy`,     lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/terms`,       lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/gdpr`,        lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/us-privacy`,  lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
  ];
}
