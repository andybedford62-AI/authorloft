import { prisma } from "@/lib/db";

export const SEO_PAGES = [
  { id: "home",                         label: "Homepage",               path: "/" },
  { id: "blog",                         label: "Blog",                   path: "/blog" },
  { id: "features",                     label: "Features",               path: "/features" },
  { id: "pricing",                      label: "Pricing",                path: "/pricing" },
  { id: "contact",                      label: "Contact",                path: "/contact" },
  { id: "resources",                    label: "Resources",              path: "/resources" },
  { id: "author-website-builder",       label: "Author Website Builder", path: "/author-website-builder" },
  { id: "sell-books-directly",          label: "Sell Books Directly",    path: "/sell-books-directly" },
  { id: "book-marketing-platform",      label: "Book Marketing",         path: "/book-marketing-platform" },
  { id: "author-newsletter-platform",   label: "Newsletter Platform",    path: "/author-newsletter-platform" },
  { id: "arc-management",               label: "ARC Management",         path: "/arc-management" },
  { id: "author-media-kit",             label: "Author Media Kit",       path: "/author-media-kit" },
  { id: "ai-tools-for-authors",         label: "AI Tools for Authors",   path: "/ai-tools-for-authors" },
  { id: "indie-author-bookstore",       label: "Indie Author Bookstore", path: "/indie-author-bookstore" },
  { id: "book-pre-orders",              label: "Book Pre-Orders",        path: "/book-pre-orders" },
  { id: "author-affiliate-program",     label: "Affiliate Program",      path: "/author-affiliate-program" },
  { id: "reader-analytics-for-authors", label: "Reader Analytics",       path: "/reader-analytics-for-authors" },
  { id: "faq",                          label: "FAQ",                    path: "/faq" },
  { id: "guides",                       label: "Guides",                 path: "/guides" },
  { id: "news",                         label: "News",                   path: "/news" },
] as const;

export type SeoPageId = typeof SEO_PAGES[number]["id"];

export const DEFAULT_OG_IMAGE = "/og-home.png";

/** Returns the OG image URL for a page, falling back to the default. */
export async function getOgImage(pageId: SeoPageId): Promise<string> {
  try {
    const config = await prisma.seoConfig.findUnique({ where: { id: pageId } });
    return config?.ogImageUrl || DEFAULT_OG_IMAGE;
  } catch {
    return DEFAULT_OG_IMAGE;
  }
}

/** Returns all SEO configs as a map. */
export async function getAllSeoConfigs(): Promise<Record<string, string | null>> {
  const configs = await prisma.seoConfig.findMany();
  const map: Record<string, string | null> = {};
  for (const c of configs) map[c.id] = c.ogImageUrl ?? null;
  return map;
}
