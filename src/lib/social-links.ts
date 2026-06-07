import { prisma } from "@/lib/db";

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon: string;
  sortOrder: number;
};

/**
 * Fetch company social links from platform settings.
 * Returns an empty array if no links are configured.
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const settings = await prisma.platformSettings.findUnique({
      where: { id: "singleton" },
      select: { socialLinks: true },
    });

    if (!settings?.socialLinks) return [];

    const links = settings.socialLinks as unknown;

    // Validate that it's an array
    if (!Array.isArray(links)) return [];

    // Return sorted by sortOrder
    return (links as SocialLink[])
      .filter((link) => link && typeof link === "object" && "url" in link && "platform" in link)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (error) {
    console.error("Failed to fetch social links:", error);
    return [];
  }
}
