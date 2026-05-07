import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseArc } from "@/lib/plan-limits";

// PUT /api/admin/books/[id]/arc/[arcId]/readers/[readerId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; arcId: string; readerId: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const arcCheck = await canUseArc(authorId);
    if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

    const { id: bookId, arcId, readerId } = await params;

    const reader = await prisma.arcReader.findFirst({
      where: {
        id: readerId,
        arcCopyId: arcId,
        arcCopy: { bookId, book: { authorId } },
      },
      select: { id: true },
    });
    if (!reader) return NextResponse.json({ error: "Reader not found" }, { status: 404 });

    const body = await req.json();
    const { status, reviewPlatform, reviewUrl, notes } = body;

    const updated = await prisma.arcReader.update({
      where: { id: readerId },
      data: {
        ...(status !== undefined && { status }),
        ...(status === "REVIEWED" && { reviewedAt: new Date() }),
        ...(reviewPlatform !== undefined && { reviewPlatform: reviewPlatform || null }),
        ...(reviewUrl !== undefined && { reviewUrl: reviewUrl?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[arc/readers PUT] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// DELETE /api/admin/books/[id]/arc/[arcId]/readers/[readerId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; arcId: string; readerId: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const arcCheck = await canUseArc(authorId);
    if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

    const { id: bookId, arcId, readerId } = await params;

    const reader = await prisma.arcReader.findFirst({
      where: {
        id: readerId,
        arcCopyId: arcId,
        arcCopy: { bookId, book: { authorId } },
      },
      select: { id: true },
    });
    if (!reader) return NextResponse.json({ error: "Reader not found" }, { status: 404 });

    await prisma.arcReader.delete({ where: { id: readerId } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[arc/readers DELETE] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
