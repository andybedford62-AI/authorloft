import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseFeature } from "@/lib/plan-limits";

// ── PATCH — update label, description, priceCents, isActive; or clear file ───
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, itemId } = await params;

  // Verify ownership via the book
  const existing = await prisma.bookDirectSaleItem.findFirst({
    where: { id: itemId, book: { id: bookId, authorId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { label, description, priceCents, isActive, isReaderMagnet, clearFile } = body;

  // Paid editions can only go live with a paid plan AND a connected Stripe
  // account. Free Reader Magnets need neither, so they activate freely.
  const willBeMagnet =
    isReaderMagnet === true || (isReaderMagnet === undefined && existing.isReaderMagnet);
  if (isActive === true && !willBeMagnet) {
    const salesCheck = await canUseFeature(authorId, "salesEnabled");
    if (!salesCheck.allowed) {
      return NextResponse.json({ error: salesCheck.reason }, { status: 403 });
    }
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { stripeConnectOnboarded: true },
    });
    if (!author?.stripeConnectOnboarded) {
      return NextResponse.json(
        { error: "Connect your Stripe account before making a paid edition live." },
        { status: 403 }
      );
    }
  }

  // Every format except PRINT ships as a file download — an active item with no
  // file would show a working buy button that fails at checkout.
  const needsFile = existing.format !== "PRINT";
  const nextFileKey = clearFile ? null : existing.fileKey;
  const requestedActive = isActive !== undefined ? isActive : existing.isActive;

  if (needsFile && !nextFileKey && requestedActive) {
    if (isActive === true) {
      return NextResponse.json(
        { error: "Upload a file for this format before activating it." },
        { status: 400 }
      );
    }
    // Reaching here means the file was just cleared while the item was already
    // active — auto-deactivate instead of leaving a broken buy button live.
  }
  const forceInactive = needsFile && !nextFileKey && requestedActive && isActive === undefined;

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
      ...(forceInactive && { isActive: false }),
      ...(isReaderMagnet !== undefined && { isReaderMagnet }),
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
  const authorId = await getAdminAuthorIdForApi();
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
