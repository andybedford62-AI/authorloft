import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published blog posts
  const blogPosts = await prisma.platformPost.findMany({
    where:   { isPublished: true },
    select:  { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  }).catch(() => []);

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url:             `${BASE}/blog/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }));

  return [
    // Core pages - highest priority
    { url: `${BASE}/`,         lastModified: new Date(), changeFrequency: "weekly",   priority: 1.0 },
    { url: `${BASE}/features`, lastModified: new Date(), changeFrequency: "monthly",  priority: 0.9 },
    { url: `${BASE}/pricing`,  lastModified: new Date(), changeFrequency: "monthly",  priority: 0.9 },

    // Blog - high priority for SEO
    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: "weekly",   priority: 0.85 },
    ...blogEntries,

    // Resources - medium priority
    { url: `${BASE}/resources`, lastModified: new Date(), changeFrequency: "monthly",  priority: 0.7 },

    // Contact - medium priority
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: "yearly",   priority: 0.6 },

    // Legal pages - lower priority
    { url: `${BASE}/privacy`,  lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/terms`,    lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/gdpr`,     lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
  ];
}
