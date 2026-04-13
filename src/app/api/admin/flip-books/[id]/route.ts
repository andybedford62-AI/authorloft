import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteFromSupabaseStorage } from "@/lib/supabase-storage";

type Params = { params: Promise<{ id: string }> };

// ─── GET /api/admin/flip-books/[id] ──────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const { id } = await params;

  const flipBook = await prisma.flipBook.findFirst({
    where: { id, authorId },
  });
  if (!flipBook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ flipBook });
}

// ─── PUT /api/admin/flip-books/[id] ──────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const { id } = await params;

  const existing = await prisma.flipBook.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, subtitle, description, slug, flipBookUrl, coverImageUrl, coverImageKey, isActive, sortOrder } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!slug?.trim()) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  // Ensure slug uniqueness (exclude self)
  const slugConflict = await prisma.flipBook.findFirst({
    where: { authorId, slug: slug.trim(), NOT: { id } },
  });
  if (slugConflict) {
    return NextResponse.json({ error: "A flip book with this slug already exists" }, { status: 409 });
  }

  // If a new cover was uploaded (different key), delete the old one from Supabase
  if (
    coverImageKey &&
    existing.coverImageKey &&
    coverImageKey !== existing.coverImageKey
  ) {
    await deleteFromSupabaseStorage("flip-book-covers", existing.coverImageKey).catch(() => {});
  }

  const flipBook = await prisma.flipBook.update({
    where: { id },
    data: {
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      description: description?.trim() || null,
      slug: slug.trim(),
      flipBookUrl: flipBookUrl?.trim() || null,
      coverImageUrl: coverImageUrl !== undefined ? (coverImageUrl?.trim() || null) : existing.coverImageUrl,
      coverImageKey: coverImageKey !== undefined ? (coverImageKey?.trim() || null) : existing.coverImageKey,
      isActive: isActive ?? existing.isActive,
      sortOrder: sortOrder ?? existing.sortOrder,
    },
  });

  return NextResponse.json({ flipBook });
}

// ─── DELETE /api/admin/flip-books/[id] ───────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const { id } = await params;

  const flipBook = await prisma.flipBook.findFirst({ where: { id, authorId } });
  if (!flipBook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Remove cover image from Supabase if stored there
  if (flipBook.coverImageKey) {
    await deleteFromSupabaseStorage("flip-book-covers", flipBook.coverImageKey).catch(() => {});
  }

  await prisma.flipBook.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
