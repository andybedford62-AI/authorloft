import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";

export async function GET(_req: Request, { params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;

  const author = await prisma.author.findFirst({
    where:  { OR: [{ slug: domain }, { customDomain: domain }], isActive: true },
    select: { slug: true, customDomain: true },
  });

  if (!author) {
    return new NextResponse("User-agent: *\nDisallow: /\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const base = getAuthorBaseUrl(author);
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`;

  return new NextResponse(body, {
    headers: {
      "Content-Type":  "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
