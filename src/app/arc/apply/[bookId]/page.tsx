import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DEFAULT_ARC_DISCLAIMER } from "@/lib/arc-constants";
import { ApplyClient } from "./apply-client";

export default async function ArcApplyPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  const arcCopy = await prisma.arcCopy.findFirst({
    where: { bookId, isActive: true },
    include: {
      book: {
        include: {
          author: { select: { name: true, displayName: true, profileImageUrl: true } },
        },
      },
    },
  });

  if (!arcCopy) notFound();

  const disclaimer = arcCopy.disclaimer ?? DEFAULT_ARC_DISCLAIMER;
  const authorName =
    arcCopy.book.author.displayName || arcCopy.book.author.name;

  return (
    <ApplyClient
      bookId={bookId}
      bookTitle={arcCopy.book.title}
      authorName={authorName}
      authorImage={arcCopy.book.author.profileImageUrl}
      bookCover={arcCopy.book.coverImageUrl}
      disclaimer={disclaimer}
    />
  );
}
