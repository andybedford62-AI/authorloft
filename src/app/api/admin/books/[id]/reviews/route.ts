import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// GET /api/admin/books/[id]/reviews
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = await getAdminAuthorIdForApi();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;

  const book = await prisma.book.findFirst({ where: { id: bookId, authorId: uid }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reviews = await prisma.bookReview.findMany({
    where: { bookId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ reviews });
}

// POST /api/admin/books/[id]/reviews
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = await getAdminAuthorIdForApi();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;

  const book = await prisma.book.findFirst({ where: { id: bookId, authorId: uid }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { quote, reviewerName, source, rating, sortOrder } = await req.json();
  if (!quote?.trim() || !reviewerName?.trim()) {
    return NextResponse.json({ error: "Quote and reviewer name are required" }, { status: 400 });
  }

  const review = await prisma.bookReview.create({
    data: {
      bookId,
      quote: quote.trim(),
      reviewerName: reviewerName.trim(),
      source: source?.trim() || null,
      rating: rating ? Number(rating) : null,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}

// PUT /api/admin/books/[id]/reviews  (reviewId in body)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = await getAdminAuthorIdForApi();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;
  const { reviewId, quote, reviewerName, source, rating, sortOrder } = await req.json();
  if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

  const existing = await prisma.bookReview.findFirst({
    where: { id: reviewId, book: { id: bookId, authorId: uid } },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const review = await prisma.bookReview.update({
    where: { id: reviewId },
    data: {
      quote: quote.trim(),
      reviewerName: reviewerName.trim(),
      source: source?.trim() || null,
      rating: rating ? Number(rating) : null,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json({ review });
}

// DELETE /api/admin/books/[id]/reviews?reviewId=xxx
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = await getAdminAuthorIdForApi();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;
  const reviewId = req.nextUrl.searchParams.get("reviewId");
  if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

  const existing = await prisma.bookReview.findFirst({
    where: { id: reviewId, book: { id: bookId, authorId: uid } },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.bookReview.delete({ where: { id: reviewId } });
  return NextResponse.json({ ok: true });
}
