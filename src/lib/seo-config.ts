import { prisma } from "@/lib/db";

export const SEO_PAGES = [
  { id: "home",      label: "Homepage",  path: "/" },
  { id: "blog",      label: "Blog",      path: "/blog" },
  { id: "features",  label: "Features",  path: "/features" },
  { id: "pricing",   label: "Pricing",   path: "/pricing" },
  { id: "contact",   label: "Contact",   path: "/contact" },
  { id: "resources", label: "Resources", path: "/resources" },
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
