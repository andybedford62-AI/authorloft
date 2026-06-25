import { prisma } from "@/lib/db";
import { NewsletterClient } from "./newsletter-client";
import { NewsletterTabs } from "./newsletter-tabs";
import { resolveAccentColor } from "@/lib/themes";
import { getAdminAuthorId } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const authorId = await getAdminAuthorId();

  const [subscribers, genres, author, campaigns, latestBook] = await Promise.all([
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
      select: {
        siteTheme: true, displayName: true, name: true,
        tagline: true, logoUrl: true, profileImageUrl: true,
        customAccentColor: true,
        linkedinUrl: true, youtubeUrl: true, facebookUrl: true, twitterUrl: true, instagramUrl: true,
        plan: { select: { tier: true } },
      },
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
    prisma.book.findFirst({
      where:   { authorId, isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select:  { title: true, coverImageUrl: true },
    }),
  ]);

  const genreMap      = Object.fromEntries(genres.map((g) => [g.id, g.name]));
  const confirmedCount = subscribers.filter((s) => s.isConfirmed).length;

  const socials = [
    { label: "Instagram", url: author?.instagramUrl },
    { label: "Facebook",  url: author?.facebookUrl  },
    { label: "X",         url: author?.twitterUrl   },
    { label: "YouTube",   url: author?.youtubeUrl   },
    { label: "LinkedIn",  url: author?.linkedinUrl  },
  ].filter((s): s is { label: string; url: string } => !!s.url);

  return (
    <NewsletterTabs
      newsletter={
        <NewsletterClient
          subscribers={subscribers.map((s) => ({
            ...s,
            subscribedAt: s.subscribedAt.toISOString(),
          }))}
          genres={genres}
          genreMap={genreMap}
          confirmedCount={confirmedCount}
          accentColor={resolveAccentColor({
            planTier:          author?.plan?.tier,
            customAccentColor: author?.customAccentColor,
            siteTheme:         author?.siteTheme,
          })}
          authorName={author?.displayName || author?.name || ""}
          tagline={author?.tagline ?? null}
          logoUrl={author?.logoUrl ?? null}
          profileImageUrl={author?.profileImageUrl ?? null}
          socials={socials}
          latestBook={latestBook ? { title: latestBook.title, coverImageUrl: latestBook.coverImageUrl } : null}
          campaigns={campaigns.map((c) => ({
            ...c,
            sentAt: c.sentAt.toISOString(),
          }))}
        />
      }
    />
  );
}
