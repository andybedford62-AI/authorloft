import { prisma } from "@/lib/db";

export const revalidate = 300;

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string),
  );
}

export async function GET() {
  const guides = await prisma.guide
    .findMany({
      where:   { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
      take:    50,
      select:  { title: true, slug: true, excerpt: true, publishedAt: true, category: true },
    })
    .catch(() => []);

  const items = guides
    .map((g) => {
      const url = `${BASE}/guides/${g.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(g.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        g.excerpt ? `      <description>${escapeXml(g.excerpt)}</description>` : null,
        g.publishedAt ? `      <pubDate>${new Date(g.publishedAt).toUTCString()}</pubDate>` : null,
        g.category ? `      <category>${escapeXml(g.category)}</category>` : null,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const lastBuild = guides[0]?.publishedAt?.toUTCString() ?? new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AuthorLoft Guides</title>
    <link>${BASE}/guides</link>
    <description>In-depth guides on author websites, direct book sales, newsletters, ARCs, branding, and everything independent authors need to succeed.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${BASE}/guides/rss.xml" rel="self" type="application/rss+xml" />
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
