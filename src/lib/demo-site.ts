import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";

const DEFAULT_DEMO_URL = "https://demo.authorloft.com";

/**
 * Resolves the URL the "See a demo author site" links should point to.
 * Falls back to the historical demo.authorloft.com URL when the super admin
 * hasn't picked an author, or the picked author was since deleted.
 */
export async function getDemoSiteUrl(): Promise<string> {
  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: "singleton" },
      select: { demoAuthor: { select: { slug: true, customDomain: true } } },
    });

    if (!settings?.demoAuthor) return DEFAULT_DEMO_URL;
    return getAuthorBaseUrl(settings.demoAuthor);
  } catch (error) {
    console.error("Failed to resolve demo site URL:", error);
    return DEFAULT_DEMO_URL;
  }
}
