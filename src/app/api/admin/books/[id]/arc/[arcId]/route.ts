import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromSupabaseStorage } from "@/lib/supabase-storage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseArc } from "@/lib/plan-limits";

// PUT /api/admin/books/[id]/arc/[arcId] — update disclaimer, expiry, isActive
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; arcId: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const arcCheck = await canUseArc(authorId);
    if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

    const { id: bookId, arcId } = await params;

    const arcCopy = await prisma.arcCopy.findFirst({
      where: { id: arcId, bookId, book: { authorId } },
      select: { id: true },
    });
    if (!arcCopy) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    const body = await req.json();
    const { disclaimer, expiresAt, isActive } = body;

    const updated = await prisma.arcCopy.update({
      where: { id: arcId },
      data: {
        ...(disclaimer !== undefined && { disclaimer: disclaimer || null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/books/arc PUT] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// DELETE /api/admin/books/[id]/arc/[arcId] — remove ARC file + record
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; arcId: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const arcCheck = await canUseArc(authorId);
    if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

    const { id: bookId, arcId } = await params;

    const arcCopy = await prisma.arcCopy.findFirst({
      where: { id: arcId, bookId, book: { authorId } },
      select: { id: true, fileKey: true },
    });
    if (!arcCopy) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    if (arcCopy.fileKey) {
      await deleteFromSupabaseStorage("arc-files", arcCopy.fileKey).catch(() => {});
    }

    await prisma.arcCopy.delete({ where: { id: arcId } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/books/arc DELETE] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
