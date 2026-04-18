import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NewsletterClient } from "./newsletter-client";
import { getThemeAccentHex } from "@/lib/themes";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;

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
