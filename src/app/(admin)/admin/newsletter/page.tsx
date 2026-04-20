import { prisma } from "@/lib/db";
import { NewsletterClient } from "./newsletter-client";
import { getThemeAccentHex } from "@/lib/themes";
import { getAdminAuthorId } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const authorId = await getAdminAuthorId();

  const [subscribers, genres, author, campaigns] = await Promise.all([
    prisma.subscriber.findMany({
      where:   { authorId },
      orderBy: { subscribedAt: "desc" },
      select: {
        id:            true,
        name:          true,
        email:         true,
        categoryPrefs: true,
        isConfirmed:   true,
        subscribedAt:  true,
      },
    }),
    prisma.genre.findMany({
      where:   { authorId },
      select:  { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.author.findUnique({
      where:  { id: authorId },
      select: { siteTheme: true, displayName: true, name: true },
    }),
    prisma.campaign.findMany({
      where:   { authorId },
      orderBy: { sentAt: "desc" },
      select: {
        id:            true,
        subject:       true,
        sentAt:        true,
        totalSent:     true,
        totalFailed:   true,
        totalTargeted: true,
      },
    }),
  ]);

  const genreMap      = Object.fromEntries(genres.map((g) => [g.id, g.name]));
  const confirmedCount = subscribers.filter((s) => s.isConfirmed).length;

  return (
    <NewsletterClient
      subscribers={subscribers.map((s) => ({
        ...s,
        subscribedAt: s.subscribedAt.toISOString(),
      }))}
      genres={genres}
      genreMap={genreMap}
      confirmedCount={confirmedCount}
      accentColor={getThemeAccentHex(author?.siteTheme)}
      authorName={author?.displayName || author?.name || ""}
      campaigns={campaigns.map((c) => ({
        ...c,
        sentAt: c.sentAt.toISOString(),
      }))}
    />
  );
}
