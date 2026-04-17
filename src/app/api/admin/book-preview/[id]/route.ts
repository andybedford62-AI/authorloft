import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteFromSupabaseStorage } from "@/lib/supabase-storage";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const record = await prisma.bookPreviewMedia.findUnique({
    where: { id },
    include: { book: { select: { authorId: true } } },
  });

  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (record.book.authorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete files from Supabase storage
  await Promise.allSettled([
    record.fileKey      ? deleteFromSupabaseStorage("book-previews", record.fileKey)      : null,
    record.thumbnailFileKey ? deleteFromSupabaseStorage("book-previews", record.thumbnailFileKey) : null,
  ].filter(Boolean));

  await prisma.bookPreviewMedia.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

// DELETE just the poster image (keep the main media file)
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const patchUserId = (session?.user as any)?.id as string | undefined;
  if (!patchUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const record = await prisma.bookPreviewMedia.findUnique({
    where: { id },
    include: { book: { select: { authorId: true } } },
  });

  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (record.book.authorId !== patchUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (record.thumbnailFileKey) {
    await deleteFromSupabaseStorage("book-previews", record.thumbnailFileKey);
  }

  const updated = await prisma.bookPreviewMedia.update({
    where: { id },
    data: { thumbnailUrl: null, thumbnailFileKey: null },
  });

  return NextResponse.json(updated);
}
