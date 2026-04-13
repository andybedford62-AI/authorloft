import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAddBook } from "@/lib/plan-limits";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;

  const books = await prisma.book.findMany({
    where: { authorId },
    include: {
      series: { select: { id: true, name: true } },
      genres: { include: { genre: { select: { id: true, name: true } } } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const body = await req.json();

  const {
    title, slug, subtitle, shortDescription, description,
    coverImageUrl, seriesId,
    isbn, pageCount, isFeatured, isPublished, directSalesEnabled, genreIds,
    availableFormats, caption, releaseDate,
  } = body;

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  // Plan limit: check book count before creating
  const bookCheck = await canAddBook(authorId);
  if (!bookCheck.allowed) {
    return NextResponse.json({ error: bookCheck.reason }, { status: 403 });
  }

  // Enforce slug uniqueness per author
  const existing = await prisma.book.findUnique({
    where: { authorId_slug: { authorId, slug } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A book with that slug already exists. Please choose a different slug." },
      { status: 409 }
    );
  }

  // Only one book may be featured at a time — clear the flag on all others first
  if (isFeatured) {
    await prisma.book.updateMany({
      where: { authorId, isFeatured: true },
      data:  { isFeatured: false },
    });
  }

  const book = await prisma.book.create({
    data: {
      authorId,
      title: title.trim(),
      slug: slug.trim(),
      subtitle: subtitle || null,
      shortDescription: shortDescription || null,
      description: description || null,
      coverImageUrl: coverImageUrl || null,
      // priceCents defaults to 0 (from schema); managed via Direct Sales items going forward
      seriesId: seriesId || null,
      isbn: isbn || null,
      pageCount: pageCount || null,
      availableFormats: Array.isArray(availableFormats) ? availableFormats : [],
      caption:     caption     || null,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      isFeatured: isFeatured ?? false,
      isPublished: isPublished ?? true,
      directSalesEnabled: directSalesEnabled ?? false,
      genres:
        genreIds?.length > 0
          ? { create: genreIds.map((genreId: string) => ({ genreId })) }
          : undefined,
    },
  });

  return NextResponse.json(book, { status: 201 });
}
