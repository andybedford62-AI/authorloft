import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

function extractSlug(host: string): string | null {
  const h = host.toLowerCase().split(":")[0];
  if (h.endsWith(`.staging.${PLATFORM_DOMAIN}`)) return h.split(".")[0];
  if (h.endsWith(`.${PLATFORM_DOMAIN}`))         return h.split(".")[0];
  return null;
}

export async function GET() {
  const h = await headers();
  const host = (h.get("host") ?? "").split(":")[0];
  if (!host) return new NextResponse("Bad request", { status: 400 });

  const slug = extractSlug(host);
  const author = await prisma.author.findFirst({
    where: {
      OR: [
        ...(slug ? [{ slug }] : []),
        { customDomain: host },
      ],
      isActive: true,
    },
    select: { id: true },
  }).catch(() => null);

  const body = author
    ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://${host}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;

  return new NextResponse(body, {
    headers: {
      "Content-Type":  "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
