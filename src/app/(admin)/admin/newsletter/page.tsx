import { prisma } from "@/lib/db";
import { NewsletterClient } from "./newsletter-client";
import { NewsletterTabs } from "./newsletter-tabs";
import { resolveAccentColor } from "@/lib/themes";
import { getAdminAuthorId } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const authorId = await getAdminAuthorId();

  const now = new Date();

  const [subscribers, genres, author, campaigns, books, activeSpecials] = await Promise.all([
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
    prisma.book.findMany({
      where:   { authorId, isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take:    4,
      select:  { id: true, title: true, coverImageUrl: true, shortDescription: true },
    }),
    prisma.special.findMany({
      where: {
        authorId, isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null },   { endsAt:   { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      select:  { id: true, title: true, description: true, ctaLabel: true, ctaUrl: true },
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

  // Book showcase preview data — featured (first) + shelf (rest).
  const featuredBook = books[0]
    ? { title: books[0].title, coverImageUrl: books[0].coverImageUrl, blurb: books[0].shortDescription }
    : null;
  const shelf = books.slice(1).map((b) => ({ title: b.title, coverImageUrl: b.coverImageUrl }));

  // Review preview — curated BookReview for the featured book, else an approved
  // reader review. Mirrors the send route so the preview matches what ships.
  let review: { quote: string; attribution: string } | null = null;
  const featuredBookId = books[0]?.id ?? null;
  const curatedReview = await prisma.bookReview.findFirst({
    where:   featuredBookId ? { bookId: featuredBookId } : { book: { authorId } },
    orderBy: { sortOrder: "asc" },
    select:  { quote: true, reviewerName: true, source: true },
  });
  if (curatedReview) {
    review = { quote: curatedReview.quote, attribution: [curatedReview.reviewerName, curatedReview.source].filter(Boolean).join(", ") };
  } else {
    const readerReview = await prisma.bookFeedback.findFirst({
      where:   featuredBookId ? { bookId: featuredBookId, status: "APPROVED" } : { book: { authorId }, status: "APPROVED" },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      select:  { comment: true, reviewerName: true },
    });
    if (readerReview?.comment) review = { quote: readerReview.comment, attribution: readerReview.reviewerName };
  }

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
          featuredBook={featuredBook}
          shelf={shelf}
          review={review}
          activeSpecials={activeSpecials}
          campaigns={campaigns.map((c) => ({
            ...c,
            sentAt: c.sentAt.toISOString(),
          }))}
        />
      }
    />
  );
}
