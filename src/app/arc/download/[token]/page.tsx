import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DEFAULT_ARC_DISCLAIMER } from "@/lib/arc-constants";
import { DownloadClient } from "./download-client";

export default async function ArcDownloadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const reader = await prisma.arcReader.findUnique({
    where: { token },
    include: {
      arcCopy: {
        include: {
          book: {
            include: {
              author: { select: { name: true, displayName: true } },
            },
          },
        },
      },
    },
  });

  if (!reader) notFound();
  if (reader.status === "DECLINED") notFound();
  if (reader.tokenExpiresAt && reader.tokenExpiresAt < new Date()) notFound();
  if (!reader.arcCopy.isActive) notFound();

  const disclaimer = reader.arcCopy.disclaimer ?? DEFAULT_ARC_DISCLAIMER;
  const authorName =
    reader.arcCopy.book.author.displayName || reader.arcCopy.book.author.name;

  return (
    <DownloadClient
      token={token}
      readerName={reader.name}
      bookTitle={reader.arcCopy.book.title}
      authorName={authorName}
      fileName={reader.arcCopy.fileName}
      disclaimer={disclaimer}
      alreadyDownloaded={!!reader.downloadedAt}
    />
  );
}
