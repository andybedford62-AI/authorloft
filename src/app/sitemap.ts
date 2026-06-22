import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getBookstoreData } from "@/lib/bookstore";
import { COMPARISON_SLUGS } from "@/lib/comparison-data";

export const dynamic = "force-dynamic";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com";
const PLATFORM_BASE = `https://www.${PLATFORM_DOMAIN}`;

function isPlatformHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  return (
    h === PLATFORM_DOMAIN ||
    h === `www.${PLATFORM_DOMAIN}` ||
    h === `staging.${PLATFORM_DOMAIN}` ||
    h === `www.staging.${PLATFORM_DOMAIN}` ||
    h.startsWith("localhost") ||
    h.endsWith(".vercel.app")
  );
}

function extractSlug(host: string): string | null {
  const h = host.toLowerCase().split(":")[0];
  // apbedford.staging.authorloft.com → apbedford
  // apbedford.authorloft.com → apbedford
  if (h.endsWith(`.staging.${PLATFORM_DOMAIN}`)) return h.split(".")[0];
  if (h.endsWith(`.${PLATFORM_DOMAIN}`)) return h.split(".")[0];
  return null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("host") ?? "";
  if (host && !isPlatformHost(host)) {
    return getAuthorSitemap(host);
  }
  return getPlatformSitemap();
}

// ── Per-author sitemap ──────────────────────────────────────────────────────
async function getAuthorSitemap(host: string): Promise<MetadataRoute.Sitemap> {
  const slug = extractSlug(host);
  const author = await prisma.author.findFirst({
    where: {
      OR: [
        ...(slug ? [{ slug }] : []),
        { customDomain: host.split(":")[0] },
      ],
      isActive: true,
    },
    select: {
      id: true, updatedAt: true,
      navShowAbout: true, navShowBooks: true, navShowContact: true,
      navShowBlog: true, navShowFlipBooks: true,
    },
  }).catch(() => null);

  if (!author) return [];

  // Use the actual request host so subdomains, custom domains and staging all
  // emit canonical URLs that resolve.
  const base = `https://${host}`;
  const now  = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: author.updatedAt, changeFrequency: "weekly", priority: 1.0 },
  ];

  if (author.navShowAbout) {
    entries.push({ url: `${base}/about`, lastModified: author.updatedAt, changeFrequency: "monthly", priority: 0.8 });
  }

  if (author.navShowBooks) {
    entries.push({ url: `${base}/books`, lastModified: now, changeFrequency: "weekly", priority: 0.9 });
    const books = await prisma.book.findMany({
      where:  { authorId: author.id, isPublished: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    for (const b of books) {
      entries.push({ url: `${base}/books/${b.slug}`, lastModified: b.updatedAt, changeFrequency: "monthly", priority: 0.8 });
    }
  }

  if (author.navShowContact) {
    entries.push({ url: `${base}/contact`, lastModified: author.updatedAt, changeFrequency: "yearly", priority: 0.5 });
  }

  if (author.navShowBlog) {
    entries.push({ url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
    const posts = await prisma.post.findMany({
      where:  { authorId: author.id, isPublished: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    for (const p of posts) {
      entries.push({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.6 });
    }
  }

  if (author.navShowFlipBooks) {
    const flipBooks = await prisma.flipBook.findMany({
      where:  { authorId: author.id, isActive: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    if (flipBooks.length > 0) {
      entries.push({ url: `${base}/flip-books`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
      for (const fb of flipBooks) {
        entries.push({ url: `${base}/flip-books/${fb.slug}`, lastModified: fb.updatedAt, changeFrequency: "monthly", priority: 0.5 });
      }
    }
  }

  const customPages = await prisma.authorPage.findMany({
    where:  { authorId: author.id, isVisible: true },
    select: { slug: true, updatedAt: true },
  }).catch(() => []);
  for (const p of customPages) {
    entries.push({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.6 });
  }

  return entries;
}

// ── Platform sitemap (marketing site) ───────────────────────────────────────
async function getPlatformSitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = PLATFORM_BASE;

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

  const { genres } = await getBookstoreData().catch(() => ({ genres: [] as { slug: string }[] }));
  const genreEntries: MetadataRoute.Sitemap = genres.map((g) => ({
    url:             `${BASE}/bookstore/genre/${g.slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.6,
  }));

  return [
    { url: `${BASE}/`,         lastModified: new Date(), changeFrequency: "weekly",   priority: 1.0 },
    { url: `${BASE}/features`, lastModified: new Date(), changeFrequency: "monthly",  priority: 0.9 },
    { url: `${BASE}/pricing`,  lastModified: new Date(), changeFrequency: "monthly",  priority: 0.9 },

    { url: `${BASE}/bookstore`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    ...genreEntries,

    ...COMPARISON_SLUGS.map((slug) => ({
      url:             `${BASE}/compare/${slug}`,
      lastModified:    new Date(),
      changeFrequency: "monthly" as const,
      priority:        0.75,
    })),

    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: "weekly",   priority: 0.85 },
    ...blogEntries,

    { url: `${BASE}/news`,     lastModified: new Date(), changeFrequency: "weekly",   priority: 0.8 },
    ...newsEntries,

    { url: `${BASE}/resources`, lastModified: new Date(), changeFrequency: "monthly",  priority: 0.7 },
    ...resourceDownloadEntries,

    { url: `${BASE}/faq`,       lastModified: new Date(), changeFrequency: "monthly",  priority: 0.7 },

    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: "yearly",   priority: 0.6 },

    { url: `${BASE}/privacy`,     lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/terms`,       lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/gdpr`,        lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
    { url: `${BASE}/us-privacy`,  lastModified: new Date(), changeFrequency: "yearly",   priority: 0.4 },
  ];
}
