import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";

export default async function sitemap({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { domain } = await params;

  const author = await prisma.author.findFirst({
    where: {
      OR: [{ slug: domain }, { customDomain: domain }],
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      customDomain: true,
      updatedAt: true,
      navShowAbout: true,
      navShowBooks: true,
      navShowContact: true,
    },
  });

  if (!author) return [];

  const base = getAuthorBaseUrl(author);
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    // Home
    {
      url: `${base}/`,
      lastModified: author.updatedAt,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  // About
  if (author.navShowAbout) {
    entries.push({
      url: `${base}/about`,
      lastModified: author.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // Books listing
  if (author.navShowBooks) {
    entries.push({
      url: `${base}/books`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });

    // Individual book pages
    const books = await prisma.book.findMany({
      where: { authorId: author.id, isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    for (const book of books) {
      entries.push({
        url: `${base}/books/${book.slug}`,
        lastModified: book.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  // Contact
  if (author.navShowContact) {
    entries.push({
      url: `${base}/contact`,
      lastModified: author.updatedAt,
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  // Custom pages (visible ones)
  const customPages = await prisma.authorPage.findMany({
    where: { authorId: author.id, isVisible: true },
    select: { slug: true, updatedAt: true },
  });

  for (const page of customPages) {
    entries.push({
      url: `${base}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
