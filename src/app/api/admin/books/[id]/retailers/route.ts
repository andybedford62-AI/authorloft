import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRetailer, RETAILER_KEYS } from "@/lib/retailers";

// ── GET — list all retailer links for a book ─────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookId } = await params;
  const authorId = (session.user as { id: string }).id;

  // Verify ownership
  const book = await prisma.book.findFirst({ where: { id: bookId, authorId } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const links = await prisma.bookRetailerLink.findMany({
    where: { bookId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(links);
}

// ── POST — add a new retailer link ────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookId } = await params;
  const authorId = (session.user as { id: string }).id;

  // Verify ownership
  const book = await prisma.book.findFirst({ where: { id: bookId, authorId } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const body = await req.json();
  const { retailer, url, label: customLabel } = body;

  // Validate
  if (!retailer || !url) {
    return NextResponse.json({ error: "retailer and url are required" }, { status: 400 });
  }
  if (!RETAILER_KEYS.includes(retailer)) {
    return NextResponse.json({ error: "Unknown retailer" }, { status: 400 });
  }

  // Determine label: use custom label if provided and retailer is "custom",
  // otherwise fall back to the predefined label.
  const label = (retailer === "custom" && customLabel?.trim())
    ? customLabel.trim()
    : (customLabel?.trim() || getRetailer(retailer).label);

  // Count existing to set sortOrder
  const count = await prisma.bookRetailerLink.count({ where: { bookId } });

  const link = await prisma.bookRetailerLink.create({
    data: { bookId, retailer, label, url, sortOrder: count },
  });

  return NextResponse.json(link, { status: 201 });
}
