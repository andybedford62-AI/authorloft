import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { canUseArc } from "@/lib/plan-limits";

export async function GET(req: NextRequest) {
  const authorId = await getAdminAuthorId();
  if (!authorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const arcCheck = await canUseArc(authorId);
  if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

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
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return NextResponse.json({ arcs });
}
