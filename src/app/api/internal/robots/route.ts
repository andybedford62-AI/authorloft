import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

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

const PLATFORM_ROBOTS = (host: string) => `User-agent: *
Allow: /
Allow: /bookstore
Allow: /blog
Allow: /news
Allow: /features
Allow: /pricing
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /gdpr
Disallow: /admin
Disallow: /super-admin
Disallow: /api/
Disallow: /auth/
Disallow: /orders/
Disallow: /maintenance
Disallow: /arc/

User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /super-admin
Disallow: /api/

Sitemap: https://${host}/sitemap.xml
`;

export async function GET() {
  const h = await headers();
  const host = (h.get("host") ?? "").split(":")[0];
  if (!host) return new NextResponse("Bad request", { status: 400 });

  if (isPlatformHost(host)) {
    return new NextResponse(PLATFORM_ROBOTS(host), {
      headers: {
        "Content-Type":  "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }

  const slug = extractAuthorSlug(host);
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

  // A retired slug has no live author but still 308s every path to the author's
  // current address (redirectIfRetiredSlug in lib/author-queries.ts). Falling
  // through to the Disallow-everything branch would stop Googlebot ever
  // fetching those redirects, stranding the exact ranking transfer the 308
  // exists to perform. No Sitemap line: a retired host has no sitemap of its
  // own (that path 404s) — the author's live subdomain advertises the real one.
  const retired = !author && slug
    ? await prisma.authorSlugHistory.findUnique({
        where: { slug },
        select: { author: { select: { isActive: true } } },
      }).catch(() => null)
    : null;

  const body = author
    ? `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://${host}/sitemap.xml\n`
    : retired?.author?.isActive
      ? `User-agent: *\nAllow: /\nDisallow: /api/\n`
      : `User-agent: *\nDisallow: /\n`;

  return new NextResponse(body, {
    headers: {
      "Content-Type":  "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
