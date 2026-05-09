import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authorId = await getAdminAuthorId();
  if (!authorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { plan: { select: { tier: true } } },
  });

  const tier = author?.plan?.tier ?? "FREE";
  if (tier === "FREE") {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const books = await prisma.book.findMany({
    where: { authorId },
    select: {
      id: true,
      title: true,
      coverImageUrl: true,
      arcCopies: {
        select: {
          id: true,
          isActive: true,
          expiresAt: true,
          files: { select: { id: true, format: true } },
          readers: { select: { status: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const arcs = books
    .map((book) => {
      const arc = book.arcCopies[0]; // One ARC per book
      if (!arc) return null;

      return {
        arcId: arc.id,
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.coverImageUrl,
        isActive: arc.isActive,
        expiresAt: arc.expiresAt?.toISOString() ?? null,
        fileCount: arc.files.length,
        readerCounts: {
          total: arc.readers.length,
          invited: arc.readers.filter((r) => r.status === "INVITED").length,
          downloaded: arc.readers.filter((r) => r.status === "DOWNLOADED").length,
          reviewed: arc.readers.filter((r) => r.status === "REVIEWED").length,
        },
      };
    })
    .filter(Boolean);

  return NextResponse.json({ arcs });
}
