import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getBookstoreData } from "@/lib/bookstore";

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

    // Blog - high priority for SEO
    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: "weekly",   priority: 0.85 },
    ...blogEntries,

    // News - company updates/announcements
    { url: `${BASE}/news`,     lastModified: new Date(), changeFrequency: "weekly",   priority: 0.8 },
    ...newsEntries,

    // Resources - medium priority
    { url: `${BASE}/resources`, lastModified: new Date(), changeFrequency: "monthly",  priority: 0.7 },

    // FAQ - medium priority (carries FAQ structured data)
    { url: `${BASE}/faq`,       lastModified: new Date(), changeFrequency: "monthly",  priority: 0.7 },

    // Contact - medium priority
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: "yearly",   priority: 0.6 },

    // Legal pages - lower priority
    { url: `${BASE}/privacy`,  lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/terms`,    lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/gdpr`,     lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
  ];
}
