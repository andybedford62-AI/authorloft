// Reusable database queries for the public author site
import { prisma } from "@/lib/db";
import { notFound, permanentRedirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveAccentColor, resolveSecondaryColor, isThemeAllowed } from "@/lib/themes";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

/**
 * When an author changes their site URL the old slug is retired, not freed.
 * Anything still pointing at it — backlinks, shared links, printed QR codes,
 * Google's index — gets a 308 to the same path on the new address instead of a
 * 404, so accumulated search ranking transfers rather than being lost.
 *
 * Exported so [domain]/layout.tsx can call it too — the layout resolves the
 * author independently (its own query, for nav/branding data) and renders
 * before any child page, so its notFound() would otherwise fire first and
 * this page-level check would never be reached.
 *
 * Returns nothing on success: permanentRedirect throws.
 */
export async function redirectIfRetiredSlug(domain: string): Promise<void> {
  const retired = await prisma.authorSlugHistory.findUnique({
    where: { slug: domain },
    select: { author: { select: { slug: true, isActive: true } } },
  });
  if (!retired?.author?.isActive) return;

  // proxy.ts stashes the pre-rewrite path so deep links survive the redirect
  const path = (await headers()).get("x-original-path") || "/";
  permanentRedirect(`https://${retired.author.slug}.${PLATFORM_DOMAIN}${path}`);
}

export async function getAuthorByDomain(domain: string) {
  const author = await prisma.author.findFirst({
    where: {
      OR: [{ slug: domain }, { customDomain: domain }],
      isActive: true,
    },
    include: {
      plan: true,
      heroFeaturedBook: {
        select: { title: true, slug: true, coverImageUrl: true, caption: true },
      },
    },
  });
  if (!author) {
    await redirectIfRetiredSlug(domain);
    notFound();
  }

  // Enforce plan-based theme access at render time:
  // FREE authors are locked to one of the 3 base colour themes regardless of what's stored.
  const planTier = author.plan?.tier ?? "FREE";
  const effectiveSiteTheme = isThemeAllowed(author.siteTheme, planTier)
    ? author.siteTheme
    : planTier === "FREE" ? "modern-minimal" : "classic-literary";

  // Accent: PREMIUM authors may override with a custom colour; everyone else gets the theme accent.
  const accentColor = resolveAccentColor({
    planTier,
    customAccentColor: author.customAccentColor,
    siteTheme: effectiveSiteTheme,
  });

  // Secondary/highlight: PREMIUM-only override for the hero banner two-tone treatment.
  const secondaryColor = resolveSecondaryColor({
    planTier,
    customSecondaryColor: author.customSecondaryColor,
  });

  return {
    ...author,
    siteTheme: effectiveSiteTheme,
    accentColor,
    secondaryColor,
  };
}

export async function getAuthorBooks(authorId: string) {
  return prisma.book.findMany({
    where: { authorId, isPublished: true },
    include: {
      series: { select: { id: true, name: true, slug: true } },
      genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
      retailerLinks: {
        where: { isActive: true },
        select: { id: true, retailer: true, label: true, url: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      directSaleItems: {
        where: { isActive: true },
        select: { id: true, format: true, label: true, description: true, priceCents: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { isFeatured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAuthorSeries(authorId: string) {
  return prisma.series.findMany({
    where: { authorId, books: { some: { isPublished: true } } },
    include: {
      books: {
        where: { isPublished: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, title: true, slug: true, coverImageUrl: true, priceCents: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAuthorGenres(authorId: string) {
  return prisma.genre.findMany({
    where: { authorId, parentId: null },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}
