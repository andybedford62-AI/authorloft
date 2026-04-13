import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAuthorId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

async function getTrack(bookId: string, trackId: string, authorId: string) {
  // Verify ownership via the book relation
  const track = await prisma.bookAudioTrack.findFirst({
    where: {
      id: trackId,
      bookId,
      book: { authorId },
    },
  });
  return track;
}

// PATCH /api/admin/books/[id]/audio/[trackId] — update title/description/sortOrder/isActive
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  const authorId = await getAuthorId();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, trackId } = await params;
  const track = await getTrack(bookId, trackId, authorId);
  if (!track) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, durationSeconds, sortOrder, isActive } = body;

  const updated = await prisma.bookAudioTrack.update({
    where: { id: trackId },
    data: {
      ...(title !== undefined     && { title: title.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(durationSeconds !== undefined && { durationSeconds: durationSeconds ? parseInt(durationSeconds) : null }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined  && { isActive }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/admin/books/[id]/audio/[trackId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  const authorId = await getAuthorId();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, trackId } = await params;
  const track = await getTrack(bookId, trackId, authorId);
  if (!track) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // If it was a Supabase upload, clean up storage
  if (track.fileKey) {
    try {
      const { deleteFromSupabaseStorage } = await import("@/lib/supabase-storage");
      await deleteFromSupabaseStorage("book-audio", track.fileKey);
    } catch (err) {
      console.warn("[audio/delete] Could not remove Supabase file:", err);
    }
  }

  await prisma.bookAudioTrack.delete({ where: { id: trackId } });

  return NextResponse.json({ ok: true });
}
