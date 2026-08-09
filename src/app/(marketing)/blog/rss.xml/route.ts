import { prisma } from "@/lib/db";

export const revalidate = 300;

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string),
  );
}

export async function GET() {
  const posts = await prisma.platformPost
    .findMany({
      where:   { isPublished: true, isNews: false },
      orderBy: { publishedAt: "desc" },
      take:    50,
      select:  { title: true, slug: true, excerpt: true, publishedAt: true, category: true, authorName: true },
    })
    .catch(() => []);

  const items = posts
    .map((p) => {
      const url = `${BASE}/blog/${p.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        p.excerpt ? `      <description>${escapeXml(p.excerpt)}</description>` : null,
        p.publishedAt ? `      <pubDate>${p.publishedAt.toUTCString()}</pubDate>` : null,
        p.category ? `      <category>${escapeXml(p.category)}</category>` : null,
        p.authorName ? `      <dc:creator>${escapeXml(p.authorName)}</dc:creator>` : null,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const lastBuild = posts[0]?.publishedAt?.toUTCString() ?? new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>AuthorLoft Blog</title>
    <link>${BASE}/blog</link>
    <description>Tips, guides, and insights for independent authors on selling books, building an audience, and publishing direct.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${BASE}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
