import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseArc } from "@/lib/plan-limits";

// GET /api/admin/books/[id]/arc — fetch active ArcCopy + reader counts for a book
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const arcCheck = await canUseArc(authorId);
    if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

    const { id: bookId } = await params;

    const book = await prisma.book.findFirst({ where: { id: bookId, authorId }, select: { id: true } });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const arcCopies = await prisma.arcCopy.findMany({
      where: { bookId },
      include: {
        readers: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            source: true,
            status: true,
            reviewPlatform: true,
            reviewUrl: true,
            notes: true,
            invitedAt: true,
            downloadedAt: true,
            reviewedAt: true,
            reminderSentAt: true,
            disclaimerAcknowledgedAt: true,
            tokenExpiresAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(arcCopies);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/books/arc GET] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
