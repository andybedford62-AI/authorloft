import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

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
  if (h.endsWith(`.staging.${PLATFORM_DOMAIN}`)) return h.split(".")[0];
  if (h.endsWith(`.${PLATFORM_DOMAIN}`)) return h.split(".")[0];
  return null;
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("host") ?? "";

  // Author subdomain or custom domain
  if (host && !isPlatformHost(host)) {
    const slug = extractSlug(host);
    const author = await prisma.author.findFirst({
      where:  {
        OR: [
          ...(slug ? [{ slug }] : []),
          { customDomain: host.split(":")[0] },
        ],
        isActive: true,
      },
      select: { id: true },
    }).catch(() => null);

    if (!author) {
      return { rules: { userAgent: "*", disallow: "/" } };
    }

    return {
      rules:   { userAgent: "*", allow: "/", disallow: ["/api/"] },
      sitemap: `https://${host}/sitemap.xml`,
    };
  }

  // Platform robots
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/bookstore", "/blog", "/news", "/features", "/pricing", "/contact", "/privacy", "/terms", "/gdpr"],
        disallow: [
          "/admin",
          "/super-admin",
          "/api/",
          "/auth/",
          "/orders/",
          "/_next",
          "/maintenance",
          "/arc/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/super-admin", "/api/", "/_next"],
      },
    ],
    sitemap: `https://www.${PLATFORM_DOMAIN}/sitemap.xml`,
  };
}
