import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
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
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.book.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  // Excerpt-only save — only sampleContent sent, skip full validation
  if (Object.keys(body).length === 1 && "sampleContent" in body) {
    const updated = await prisma.book.update({
      where: { id },
      data: { sampleContent: body.sampleContent || null },
    });
    return NextResponse.json(updated);
  }

  const {
    title, slug, subtitle, shortDescription, description,
    coverImageUrl, seriesId, priceCents,
    isbn, pageCount, isFeatured, isPublished, directSalesEnabled, listInBookstore, genreIds,
    availableFormats, caption, releaseDate, flipBookUrl, sampleContent,
    isPreOrder, preOrderDate, autoSendLaunchEmail, showCountdown, launchDate,
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

  // Enforce bookstore listing limit when the author is turning this on
  if (listInBookstore && !existing.listInBookstore) {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { plan: { select: { bookstoreListingLimit: true } } },
    });
    const limit = author?.plan?.bookstoreListingLimit ?? -1;
    if (limit !== -1) {
      const currentCount = await prisma.book.count({ where: { authorId, listInBookstore: true, id: { not: id } } });
      if (currentCount >= limit) {
        return NextResponse.json(
          { error: `Your plan allows up to ${limit} bookstore listing${limit === 1 ? "" : "s"}. Upgrade to list more books.` },
          { status: 403 }
        );
      }
    }
  }

  const book = await prisma.$transaction(async (tx) => {
    // Only one book may be featured at a time — clear the flag on all others first
    if (isFeatured) {
      await tx.book.updateMany({
        where: { authorId, id: { not: id }, isFeatured: true },
        data:  { isFeatured: false },
      });
    }

    // Replace all genre assignments atomically with the book update
    await tx.bookGenre.deleteMany({ where: { bookId: id } });

    return tx.book.update({
      where: { id },
      data: {
        title: title.trim(),
        slug: slug.trim(),
        subtitle: subtitle || null,
        shortDescription: shortDescription || null,
        description: description || null,
        coverImageUrl: coverImageUrl || null,
        priceCents: typeof priceCents === "number" ? priceCents : 0,
        seriesId: seriesId || null,
        isbn: isbn || null,
        pageCount: pageCount || null,
        availableFormats: Array.isArray(availableFormats) ? availableFormats : [],
        caption:       caption       || null,
        releaseDate:   releaseDate ? new Date(releaseDate) : null,
        flipBookUrl:   flipBookUrl   || null,
        sampleContent: sampleContent || null,
        isFeatured: isFeatured ?? false,
        isPublished: isPublished ?? true,
        directSalesEnabled: directSalesEnabled ?? false,
        listInBookstore: listInBookstore ?? false,
        isPreOrder: isPreOrder ?? false,
        preOrderDate: isPreOrder && preOrderDate ? new Date(preOrderDate) : null,
        autoSendLaunchEmail: isPreOrder ? (autoSendLaunchEmail ?? false) : false,
        showCountdown: showCountdown ?? false,
        launchDate: showCountdown && launchDate ? new Date(launchDate) : null,
        genres:
          genreIds?.length > 0
            ? { create: genreIds.map((genreId: string) => ({ genreId })) }
            : undefined,
      },
    });
  });

  return NextResponse.json(book);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.book.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
