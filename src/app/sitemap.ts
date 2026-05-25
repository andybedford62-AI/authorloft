import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await prisma.platformPost.findMany({
    where:   { isPublished: true },
    select:  { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  }).catch(() => []);

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url:             `${BASE}/blog/${p.slug}`,
    lastModified:    p.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }));

  return [
    { url: `${BASE}/`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/features`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/pricing`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...(blogPosts.length > 0 ? [{ url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 }] : []),
    ...blogEntries,
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE}/privacy`,  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,    lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
