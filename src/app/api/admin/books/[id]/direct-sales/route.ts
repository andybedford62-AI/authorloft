import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const VALID_FORMATS = ["EBOOK", "AUDIO", "FLIPBOOK", "PRINT"] as const;
type DirectSaleFormat = (typeof VALID_FORMATS)[number];

// ── GET — list all direct sale items for a book ───────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;

  const book = await prisma.book.findFirst({ where: { id: bookId, authorId } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const items = await prisma.bookDirectSaleItem.findMany({
    where: { bookId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(items);
}

// ── POST — create a new direct sale item ──────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;

  const book = await prisma.book.findFirst({ where: { id: bookId, authorId } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  // Plan gate: sales feature must be enabled
  const salesCheck = await canUseFeature(authorId, "salesEnabled");
  if (!salesCheck.allowed) {
    return NextResponse.json({ error: salesCheck.reason }, { status: 403 });
  }

  // Stripe Connect gate: author must have completed onboarding before listing items
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { stripeConnectOnboarded: true },
  });
  if (!author?.stripeConnectOnboarded) {
    return NextResponse.json(
      { error: "You must connect your Stripe account before listing items for direct sale." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { format, label, description, priceCents } = body;

  if (!format || !VALID_FORMATS.includes(format as DirectSaleFormat)) {
    return NextResponse.json({ error: "Invalid format. Must be EBOOK, AUDIO, FLIPBOOK, or PRINT." }, { status: 400 });
  }
  if (!label?.trim()) {
    return NextResponse.json({ error: "Label is required." }, { status: 400 });
  }
  if (typeof priceCents !== "number" || priceCents < 0) {
    return NextResponse.json({ error: "priceCents must be a non-negative number." }, { status: 400 });
  }

  const count = await prisma.bookDirectSaleItem.count({ where: { bookId } });

  const item = await prisma.bookDirectSaleItem.create({
    data: {
      bookId,
      format: format as DirectSaleFormat,
      label: label.trim(),
      description: description?.trim() || null,
      priceCents,
      sortOrder: count,
    },
  });

  // Ensure the book has directSalesEnabled so items are visible on the public site
  if (!book.directSalesEnabled) {
    await prisma.book.update({ where: { id: bookId }, data: { directSalesEnabled: true } });
  }

  return NextResponse.json(item, { status: 201 });
}
