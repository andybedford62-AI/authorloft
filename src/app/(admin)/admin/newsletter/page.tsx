import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NewsletterClient } from "./newsletter-client";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;

  const [subscribers, genres, author] = await Promise.all([
    prisma.subscriber.findMany({
      where: { authorId },
      orderBy: { subscribedAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        categoryPrefs: true,
        isConfirmed: true,
        subscribedAt: true,
      },
    }),
    prisma.genre.findMany({
      where: { authorId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.author.findUnique({
      where: { id: authorId },
      select: { accentColor: true, displayName: true, name: true },
    }),
  ]);

  const genreMap = Object.fromEntries(genres.map((g) => [g.id, g.name]));
  const confirmedCount = subscribers.filter((s) => s.isConfirmed).length;
  const smtpConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  return (
    <NewsletterClient
      subscribers={subscribers.map((s) => ({
        ...s,
        subscribedAt: s.subscribedAt.toISOString(),
      }))}
      genres={genres}
      genreMap={genreMap}
      confirmedCount={confirmedCount}
      smtpConfigured={smtpConfigured}
      accentColor={author?.accentColor ?? "#7B2D2D"}
      authorName={author?.displayName || author?.name || ""}
    />
  );
}
