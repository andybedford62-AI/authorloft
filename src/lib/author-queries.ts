// Reusable database queries for the public author site
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getThemeAccentHex, isThemeAllowed } from "@/lib/themes";

export async function getAuthorByDomain(domain: string) {
  const author = await prisma.author.findFirst({
    where: {
      OR: [{ slug: domain }, { customDomain: domain }],
      isActive: true,
    },
    include: {
      plan: true,
    },
  });
  if (!author) notFound();

  // Enforce plan-based theme access at render time:
  // FREE authors are locked to Modern Minimal regardless of what's stored.
  const planTier = author.plan?.tier ?? "FREE";
  const effectiveSiteTheme = isThemeAllowed(author.siteTheme, planTier)
    ? author.siteTheme
    : planTier === "FREE" ? "modern-minimal" : "classic-literary";

  // Compute accent from the effective theme — accentColor is no longer user-controlled.
  return {
    ...author,
    siteTheme: effectiveSiteTheme,
    accentColor: getThemeAccentHex(effectiveSiteTheme),
  };
}

export async function getAuthorBooks(authorId: string) {
  return prisma.book.findMany({
    where: { authorId, isPublished: true },
    include: {
      series: { select: { id: true, name: true, slug: true } },
      genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
      // Only include active retailer links for the public site
      retailerLinks: {
        where: { isActive: true },
        select: { id: true, retailer: true, label: true, url: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      // Only include active direct sale items for the public site
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
    where: { authorId },
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
