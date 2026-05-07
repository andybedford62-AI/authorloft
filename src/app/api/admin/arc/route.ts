import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseArc } from "@/lib/plan-limits";

// GET /api/admin/arc — overview of all ARC copies across the author's books
export async function GET() {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const arcCheck = await canUseArc(authorId);
    if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

    const arcCopies = await prisma.arcCopy.findMany({
      where: { book: { authorId } },
      include: {
        book: { select: { id: true, title: true, coverImageUrl: true } },
        readers: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = arcCopies.map((arc) => ({
      id: arc.id,
      bookId: arc.book.id,
      bookTitle: arc.book.title,
      bookCover: arc.book.coverImageUrl,
      fileName: arc.fileName,
      isActive: arc.isActive,
      expiresAt: arc.expiresAt,
      createdAt: arc.createdAt,
      counts: {
        total: arc.readers.length,
        invited: arc.readers.filter((r) => r.status === "INVITED").length,
        downloaded: arc.readers.filter((r) => r.status === "DOWNLOADED").length,
        reviewed: arc.readers.filter((r) => r.status === "REVIEWED").length,
        pending: arc.readers.filter((r) => r.status === "PENDING").length,
      },
    }));

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/arc] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
