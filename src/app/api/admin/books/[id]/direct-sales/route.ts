import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
    include: { _count: { select: { magnetLeads: true } } },
  });

  // Surface how many readers each magnet has captured so the editor can show it.
  return NextResponse.json(
    items.map(({ _count, ...item }) => ({ ...item, magnetLeadCount: _count.magnetLeads }))
  );
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

  // Enforce format restrictions by plan tier: FREE = EBOOK only,
  // STANDARD = EBOOK + PRINT, PREMIUM = all formats.
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { plan: { select: { tier: true } } },
  });
  const tier = author?.plan?.tier ?? "FREE";

  const body = await req.json();
  const { format, label, description, priceCents, isReaderMagnet } = body;

  if (!format || !VALID_FORMATS.includes(format as DirectSaleFormat)) {
    return NextResponse.json({ error: "Invalid format. Must be EBOOK, AUDIO, FLIPBOOK, or PRINT." }, { status: 400 });
  }

  const TIER_FORMATS: Record<string, readonly string[]> = {
    FREE:     ["EBOOK"],
    STANDARD: ["EBOOK", "PRINT"],
    PREMIUM:  ["EBOOK", "AUDIO", "FLIPBOOK", "PRINT"],
  };
  const allowed = TIER_FORMATS[tier] ?? TIER_FORMATS.FREE;
  if (!allowed.includes(format)) {
    return NextResponse.json(
      { error: `Your plan does not include the ${format} format. Upgrade to access more formats.` },
      { status: 403 },
    );
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
      isReaderMagnet: isReaderMagnet === true,
      sortOrder: count,
    },
  });

  // Ensure the book has directSalesEnabled so items are visible on the public site
  if (!book.directSalesEnabled) {
    await prisma.book.update({ where: { id: bookId }, data: { directSalesEnabled: true } });
  }

  return NextResponse.json(item, { status: 201 });
}
