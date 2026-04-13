import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAuthorId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAuthorId();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const book = await prisma.book.findFirst({
    where: { id, authorId },
    include: {
      series: true,
      genres: { include: { genre: true } },
    },
  });

  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(book);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAuthorId();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.book.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    title, slug, subtitle, shortDescription, description,
    coverImageUrl, seriesId,
    isbn, pageCount, isFeatured, isPublished, directSalesEnabled, genreIds,
    availableFormats, caption, releaseDate, flipBookUrl,
  } = body;

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  // Check slug uniqueness if slug changed
  if (slug.trim() !== existing.slug) {
    const conflict = await prisma.book.findUnique({
      where: { authorId_slug: { authorId, slug: slug.trim() } },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "A book with that slug already exists. Please choose a different slug." },
        { status: 409 }
      );
    }
  }

  // Only one book may be featured at a time — clear the flag on all others first
  if (isFeatured) {
    await prisma.book.updateMany({
      where: { authorId, id: { not: id }, isFeatured: true },
      data:  { isFeatured: false },
    });
  }

  // Replace all genre assignments
  await prisma.bookGenre.deleteMany({ where: { bookId: id } });

  const book = await prisma.book.update({
    where: { id },
    data: {
      title: title.trim(),
      slug: slug.trim(),
      subtitle: subtitle || null,
      shortDescription: shortDescription || null,
      description: description || null,
      coverImageUrl: coverImageUrl || null,
      // priceCents and externalBuyUrl are no longer managed by the book form.
      // Leave existing values untouched so legacy data is preserved.
      seriesId: seriesId || null,
      isbn: isbn || null,
      pageCount: pageCount || null,
      availableFormats: Array.isArray(availableFormats) ? availableFormats : [],
      caption:     caption     || null,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      flipBookUrl: flipBookUrl || null,
      isFeatured: isFeatured ?? false,
      isPublished: isPublished ?? true,
      directSalesEnabled: directSalesEnabled ?? false,
      genres:
        genreIds?.length > 0
          ? { create: genreIds.map((genreId: string) => ({ genreId })) }
          : undefined,
    },
  });

  return NextResponse.json(book);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAuthorId();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.book.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
