import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getBookstoreData } from "@/lib/bookstore";
import { COMPARISON_SLUGS } from "@/lib/comparison-data";
import { LANDING_PAGES } from "@/lib/landing-page-data";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

function isPlatformHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  return (
    h === PLATFORM_DOMAIN ||
    h === `www.${PLATFORM_DOMAIN}` ||
    h === `staging.${PLATFORM_DOMAIN}` ||
    h === `www.staging.${PLATFORM_DOMAIN}` ||
    h === "localhost"
  );
}

function extractAuthorSlug(host: string): string | null {
  const h = host.toLowerCase().split(":")[0];
  if (h.endsWith(`.staging.${PLATFORM_DOMAIN}`)) return h.split(".")[0];
  if (h.endsWith(`.${PLATFORM_DOMAIN}`))         return h.split(".")[0];
  return null;
}

type Entry = {
  loc: string;
  lastmod?: Date;
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: number;
};

function xmlEscape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
}

function buildXml(entries: Entry[]) {
  const urls = entries.map((e) => {
    const parts = [`<loc>${xmlEscape(e.loc)}</loc>`];
    if (e.lastmod)    parts.push(`<lastmod>${e.lastmod.toISOString()}</lastmod>`);
    if (e.changefreq) parts.push(`<changefreq>${e.changefreq}</changefreq>`);
    if (e.priority !== undefined) parts.push(`<priority>${e.priority.toFixed(1)}</priority>`);
    return `  <url>${parts.join("")}</url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function buildPlatformSitemap(host: string): Promise<Entry[]> {
  const base = `https://${host}`;
  const now  = new Date();

  const [blogPosts, newsPosts, resourceDownloads, bookstore, guides] = await Promise.all([
    prisma.platformPost.findMany({
      where:   { isPublished: true, isNews: false },
      select:  { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }).catch(() => []),
    prisma.platformPost.findMany({
      where:   { isPublished: true, isNews: true },
      select:  { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }).catch(() => []),
    prisma.resourceDownload.findMany({
      where:  { isPublished: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
    getBookstoreData().catch(() => ({ genres: [] as { slug: string }[] })),
    prisma.guide.findMany({
      where:  { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    }).catch(() => []),
  ]);

  const entries: Entry[] = [
    { loc: `${base}/`,          lastmod: now, changefreq: "weekly",  priority: 1.0 },
    { loc: `${base}/features`,  lastmod: now, changefreq: "monthly", priority: 0.9 },
    { loc: `${base}/solutions`, lastmod: now, changefreq: "monthly", priority: 0.85 },
    { loc: `${base}/pricing`,   lastmod: now, changefreq: "monthly", priority: 0.9 },
    { loc: `${base}/compare`,   lastmod: now, changefreq: "monthly", priority: 0.8 },
    { loc: `${base}/bookstore`, lastmod: now, changefreq: "weekly",  priority: 0.85 },
  ];

  for (const g of bookstore.genres) {
    entries.push({ loc: `${base}/bookstore/genre/${g.slug}`, lastmod: now, changefreq: "weekly", priority: 0.6 });
  }

  // Solution landing pages — driven off LANDING_PAGES so adding one to that
  // record is enough; a hand-maintained list here is what let all 12 of these
  // sit outside the sitemap unnoticed (see docs/CHANGELOG.md Aug 21 2026).
  for (const slug of Object.keys(LANDING_PAGES)) {
    entries.push({ loc: `${base}/${slug}`, lastmod: now, changefreq: "monthly", priority: 0.8 });
  }

  for (const slug of COMPARISON_SLUGS) {
    entries.push({ loc: `${base}/compare/${slug}`, lastmod: now, changefreq: "monthly", priority: 0.75 });
  }

  entries.push({ loc: `${base}/blog`, lastmod: now, changefreq: "weekly", priority: 0.85 });
  for (const p of blogPosts) {
    entries.push({ loc: `${base}/blog/${p.slug}`, lastmod: p.updatedAt, changefreq: "monthly", priority: 0.7 });
  }

  entries.push({ loc: `${base}/news`, lastmod: now, changefreq: "weekly", priority: 0.8 });
  for (const p of newsPosts) {
    entries.push({ loc: `${base}/news/${p.slug}`, lastmod: p.updatedAt, changefreq: "monthly", priority: 0.7 });
  }

  entries.push({ loc: `${base}/guides`, lastmod: now, changefreq: "weekly", priority: 0.85 });
  for (const g of guides) {
    entries.push({ loc: `${base}/guides/${g.slug}`, lastmod: g.updatedAt, changefreq: "monthly", priority: 0.7 });
  }

  entries.push({ loc: `${base}/resources`, lastmod: now, changefreq: "monthly", priority: 0.7 });
  for (const d of resourceDownloads) {
    entries.push({ loc: `${base}/resources/${d.slug}`, lastmod: d.updatedAt, changefreq: "monthly", priority: 0.65 });
  }

  entries.push(
    { loc: `${base}/faq`,        lastmod: now, changefreq: "monthly", priority: 0.7 },
    { loc: `${base}/contact`,    lastmod: now, changefreq: "yearly",  priority: 0.6 },
    { loc: `${base}/privacy`,    lastmod: now, changefreq: "yearly",  priority: 0.4 },
    { loc: `${base}/terms`,      lastmod: now, changefreq: "yearly",  priority: 0.4 },
    { loc: `${base}/gdpr`,       lastmod: now, changefreq: "yearly",  priority: 0.4 },
    { loc: `${base}/us-privacy`, lastmod: now, changefreq: "yearly",  priority: 0.4 },
  );

  return entries;
}

async function buildAuthorSitemap(host: string): Promise<Entry[] | null> {
  const slug = extractAuthorSlug(host);
  const author = await prisma.author.findFirst({
    where: {
      OR: [
        ...(slug ? [{ slug }] : []),
        { customDomain: host },
      ],
      isActive: true,
    },
    select: {
      id: true, updatedAt: true,
      navShowAbout: true, navShowBooks: true, navShowContact: true,
      navShowBlog: true, navShowFlipBooks: true, navShowMusic: true,
      navShowCourses: true, navShowSpecials: true, navShowBundles: true,
      plan: { select: { coursesEnabled: true, bundlesEnabled: true, musicEnabled: true } },
    },
  }).catch(() => null);

  if (!author) return null;

  const base = `https://${host}`;
  const now  = new Date();
  const entries: Entry[] = [
    { loc: `${base}/`, lastmod: author.updatedAt, changefreq: "weekly", priority: 1.0 },
  ];

  if (author.navShowAbout) {
    entries.push({ loc: `${base}/about`, lastmod: author.updatedAt, changefreq: "monthly", priority: 0.8 });
  }

  if (author.navShowBooks) {
    entries.push({ loc: `${base}/books`, lastmod: now, changefreq: "weekly", priority: 0.9 });
    const books = await prisma.book.findMany({
      where:  { authorId: author.id, isPublished: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    for (const b of books) {
      entries.push({ loc: `${base}/books/${b.slug}`, lastmod: b.updatedAt, changefreq: "monthly", priority: 0.8 });
    }
  }

  if (author.navShowContact) {
    entries.push({ loc: `${base}/contact`, lastmod: author.updatedAt, changefreq: "yearly", priority: 0.5 });
  }

  if (author.navShowBlog) {
    entries.push({ loc: `${base}/blog`, lastmod: now, changefreq: "weekly", priority: 0.7 });
    const posts = await prisma.post.findMany({
      where:  { authorId: author.id, isPublished: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    for (const p of posts) {
      entries.push({ loc: `${base}/blog/${p.slug}`, lastmod: p.updatedAt, changefreq: "monthly", priority: 0.6 });
    }
  }

  if (author.navShowFlipBooks) {
    const flipBooks = await prisma.flipBook.findMany({
      where:  { authorId: author.id, isActive: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    if (flipBooks.length > 0) {
      entries.push({ loc: `${base}/flip-books`, lastmod: now, changefreq: "monthly", priority: 0.6 });
      for (const fb of flipBooks) {
        entries.push({ loc: `${base}/flip-books/${fb.slug}`, lastmod: fb.updatedAt, changefreq: "monthly", priority: 0.5 });
      }
    }
  }

  if (author.navShowMusic && author.plan?.musicEnabled) {
    const lists = await prisma.course.findMany({
      where:  { authorId: author.id, kind: "MUSIC", isPublished: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    if (lists.length > 0) {
      entries.push({ loc: `${base}/music`, lastmod: now, changefreq: "monthly", priority: 0.6 });
      for (const l of lists) {
        entries.push({ loc: `${base}/music/${l.slug}`, lastmod: l.updatedAt, changefreq: "monthly", priority: 0.5 });
      }
    }
  }

  if (author.navShowCourses && author.plan?.coursesEnabled) {
    const courses = await prisma.course.findMany({
      where:  { authorId: author.id, kind: "COURSE", isPublished: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    if (courses.length > 0) {
      entries.push({ loc: `${base}/courses`, lastmod: now, changefreq: "weekly", priority: 0.7 });
      for (const c of courses) {
        entries.push({ loc: `${base}/courses/${c.slug}`, lastmod: c.updatedAt, changefreq: "monthly", priority: 0.6 });
      }
    }
  }

  // /bundles itself only redirects to /books?tab=bundles, so it is deliberately
  // not submitted — the detail pages are the real content.
  if (author.navShowBundles && author.plan?.bundlesEnabled) {
    const bundles = await prisma.bundle.findMany({
      where:  { authorId: author.id, isPublished: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    for (const b of bundles) {
      entries.push({ loc: `${base}/bundles/${b.slug}`, lastmod: b.updatedAt, changefreq: "monthly", priority: 0.6 });
    }
  }

  if (author.navShowSpecials) {
    // Only worth submitting when there's an offer to see.
    const activeSpecials = await prisma.special.count({
      where: { authorId: author.id, isActive: true },
    }).catch(() => 0);
    if (activeSpecials > 0) {
      entries.push({ loc: `${base}/specials`, lastmod: now, changefreq: "weekly", priority: 0.6 });
    }
  }

  // Series pages are reached from the books they group, so they follow Books'
  // visibility rather than having a toggle of their own.
  if (author.navShowBooks) {
    const series = await prisma.series.findMany({
      where:  { authorId: author.id },
      select: { slug: true, updatedAt: true },
    }).catch(() => []);
    for (const sr of series) {
      entries.push({ loc: `${base}/series/${sr.slug}`, lastmod: sr.updatedAt, changefreq: "monthly", priority: 0.5 });
    }
  }

  const customPages = await prisma.authorPage.findMany({
    where:  { authorId: author.id, isVisible: true },
    select: { slug: true, updatedAt: true },
  }).catch(() => []);
  for (const p of customPages) {
    entries.push({ loc: `${base}/${p.slug}`, lastmod: p.updatedAt, changefreq: "monthly", priority: 0.6 });
  }

  return entries;
}

export async function GET() {
  const h = await headers();
  const host = (h.get("host") ?? "").split(":")[0];
  if (!host) return new NextResponse("Bad request", { status: 400 });

  const entries = isPlatformHost(host)
    ? await buildPlatformSitemap(host)
    : await buildAuthorSitemap(host);

  if (!entries) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(buildXml(entries), {
    headers: {
      "Content-Type":  "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
