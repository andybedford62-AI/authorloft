import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export const revalidate = 3600;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET() {
  const [blogPosts, newsPosts] = await Promise.all([
    prisma.platformPost
      .findMany({
        where: { isPublished: true, isNews: false },
        select: {
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          publishedAt: true,
          authorName: true,
          category: true,
        },
        orderBy: { publishedAt: "desc" },
      })
      .catch(() => []),
    prisma.platformPost
      .findMany({
        where: { isPublished: true, isNews: true },
        select: {
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          publishedAt: true,
          authorName: true,
        },
        orderBy: { publishedAt: "desc" },
      })
      .catch(() => []),
  ]);

  const lines: string[] = [
    "# AuthorLoft",
    "",
    "> The author career platform for independent authors. Own your readers, sell direct, and grow your business — all on one platform, free forever.",
    "",
    "AuthorLoft is a multi-tenant SaaS platform that gives independent authors everything they need to own their career — sell books directly to readers, build a reader list nobody can take away, and grow their audience — without technical knowledge. Each author gets their own subdomain (e.g. authorname.authorloft.com) or can connect a custom domain.",
    "",
    "## Features & Pricing",
    "",
    `- [Features](${BASE}/features): Full feature list across Free, Standard ($19.99/mo), and Premium ($79.99/mo) plans — book catalog, direct sales, custom domain, flip book previews, AI writing tools, and reader analytics.`,
    `- [Pricing](${BASE}/pricing): Plan comparison with full pricing details and side-by-side comparison against competitors (Tertulia, StoryOrigin, BookFunnel).`,
    "",
  ];

  if (blogPosts.length > 0) {
    lines.push("## Blog", "");
    for (const post of blogPosts) {
      lines.push(`### [${post.title}](${BASE}/blog/${post.slug})`);
      if (post.publishedAt)
        lines.push(`Published: ${post.publishedAt.toISOString().split("T")[0]}`);
      if (post.authorName) lines.push(`Author: ${post.authorName}`);
      if (post.category) lines.push(`Category: ${post.category}`);
      lines.push("");
      if (post.excerpt) lines.push(post.excerpt, "");
      const body = stripHtml(post.content);
      if (body) lines.push(body, "");
      lines.push("---", "");
    }
  }

  if (newsPosts.length > 0) {
    lines.push("## News", "");
    for (const post of newsPosts) {
      lines.push(`### [${post.title}](${BASE}/news/${post.slug})`);
      if (post.publishedAt)
        lines.push(`Published: ${post.publishedAt.toISOString().split("T")[0]}`);
      if (post.authorName) lines.push(`Author: ${post.authorName}`);
      lines.push("");
      if (post.excerpt) lines.push(post.excerpt, "");
      const body = stripHtml(post.content);
      if (body) lines.push(body, "");
      lines.push("---", "");
    }
  }

  lines.push(
    "## Resources",
    "",
    `- [Resources](${BASE}/resources): Curated directory of trusted tools, communities, and organisations every indie author should know about.`,
    `- [Bookstore](${BASE}/bookstore): Discover books from independent authors across all genres — buy directly from each author's own site.`,
    `- [Contact](${BASE}/contact): Get in touch with the AuthorLoft team — replies within one business day.`,
    "",
    "## Legal",
    "",
    `- [Privacy Policy](${BASE}/privacy)`,
    `- [Terms of Service](${BASE}/terms)`,
    `- [GDPR & Data Rights](${BASE}/gdpr)`,
  );

  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
