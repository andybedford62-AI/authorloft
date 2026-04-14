import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAuthorId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

// ── PATCH — update label, description, priceCents, isActive; or clear file ───
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const authorId = await getAuthorId();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, itemId } = await params;

  // Verify ownership via the book
  const existing = await prisma.bookDirectSaleItem.findFirst({
    where: { id: itemId, book: { id: bookId, authorId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { label, description, priceCents, isActive, clearFile } = body;

  // If clearFile is requested, delete file from Supabase storage
  if (clearFile && existing.fileKey) {
    try {
      const { deleteFromSupabaseStorage } = await import("@/lib/supabase-storage");
      await deleteFromSupabaseStorage("book-files", existing.fileKey);
    } catch (e) {
      console.error("[direct-sales/patch] Failed to delete file:", e);
    }
  }

  const updated = await prisma.bookDirectSaleItem.update({
    where: { id: itemId },
    data: {
      ...(label !== undefined && { label: label.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(priceCents !== undefined && { priceCents }),
      ...(isActive !== undefined && { isActive }),
      ...(clearFile && { fileUrl: null, fileKey: null, fileName: null }),
    },
  });

  return NextResponse.json(updated);
}

// ── DELETE — remove item and its associated file from storage ─────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const authorId = await getAuthorId();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, itemId } = await params;

  const existing = await prisma.bookDirectSaleItem.findFirst({
    where: { id: itemId, book: { id: bookId, authorId } },
    select: { id: true, fileKey: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete associated file from Supabase storage (fire-and-forget)
  if (existing.fileKey) {
    import("@/lib/supabase-storage")
      .then(({ deleteFromSupabaseStorage }) =>
        deleteFromSupabaseStorage("book-files", existing.fileKey!)
      )
      .catch((e) => console.error("[direct-sales/delete] Failed to delete file:", e));
  }

  await prisma.bookDirectSaleItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
