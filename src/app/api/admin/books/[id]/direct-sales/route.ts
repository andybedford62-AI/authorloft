import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";

const VALID_FORMATS = ["EBOOK", "FLIPBOOK", "PRINT"] as const;
type DirectSaleFormat = (typeof VALID_FORMATS)[number];

// ── GET — list all direct sale items for a book ───────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;
  const authorId = (session.user as any).id as string;

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
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;
  const authorId = (session.user as any).id as string;

  const book = await prisma.book.findFirst({ where: { id: bookId, authorId } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  // Plan gate: sales feature must be enabled
  const salesCheck = await canUseFeature(authorId, "salesEnabled");
  if (!salesCheck.allowed) {
    return NextResponse.json({ error: salesCheck.reason }, { status: 403 });
  }

  const body = await req.json();
  const { format, label, description, priceCents } = body;

  if (!format || !VALID_FORMATS.includes(format as DirectSaleFormat)) {
    return NextResponse.json({ error: "Invalid format. Must be EBOOK, FLIPBOOK, or PRINT." }, { status: 400 });
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

  return NextResponse.json(item, { status: 201 });
}
