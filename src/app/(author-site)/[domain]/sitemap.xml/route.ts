import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";

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

export async function GET(_req: Request, { params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  const author = await prisma.author.findFirst({
    where:  { OR: [{ slug: domain }, { customDomain: domain }], isActive: true },
    select: {
      id: true, slug: true, customDomain: true, updatedAt: true,
      navShowAbout: true, navShowBooks: true, navShowContact: true,
      navShowBlog: true, navShowFlipBooks: true,
    },
  });

  if (!author) return new NextResponse("Not found", { status: 404 });

  const base = getAuthorBaseUrl(author);
  const now  = new Date();
  const entries: Entry[] = [{ loc: `${base}/`, lastmod: author.updatedAt, changefreq: "weekly", priority: 1.0 }];

  if (author.navShowAbout) {
    entries.push({ loc: `${base}/about`, lastmod: author.updatedAt, changefreq: "monthly", priority: 0.8 });
  }

  if (author.navShowBooks) {
    entries.push({ loc: `${base}/books`, lastmod: now, changefreq: "weekly", priority: 0.9 });
    const books = await prisma.book.findMany({
      where:  { authorId: author.id, isPublished: true },
      select: { slug: true, updatedAt: true },
    });
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
    });
    for (const p of posts) {
      entries.push({ loc: `${base}/blog/${p.slug}`, lastmod: p.updatedAt, changefreq: "monthly", priority: 0.6 });
    }
  }

  if (author.navShowFlipBooks) {
    const flipBooks = await prisma.flipBook.findMany({
      where:  { authorId: author.id, isActive: true },
      select: { slug: true, updatedAt: true },
    });
    if (flipBooks.length > 0) {
      entries.push({ loc: `${base}/flip-books`, lastmod: now, changefreq: "monthly", priority: 0.6 });
      for (const fb of flipBooks) {
        entries.push({ loc: `${base}/flip-books/${fb.slug}`, lastmod: fb.updatedAt, changefreq: "monthly", priority: 0.5 });
      }
    }
  }

  const customPages = await prisma.authorPage.findMany({
    where:  { authorId: author.id, isVisible: true },
    select: { slug: true, updatedAt: true },
  });
  for (const p of customPages) {
    entries.push({ loc: `${base}/${p.slug}`, lastmod: p.updatedAt, changefreq: "monthly", priority: 0.6 });
  }

  return new NextResponse(buildXml(entries), {
    headers: {
      "Content-Type":  "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
