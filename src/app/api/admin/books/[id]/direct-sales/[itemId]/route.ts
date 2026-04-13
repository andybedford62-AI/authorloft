import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getAuthorId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}

// ── PATCH — update a direct sale item (label, description, priceCents, isActive) ──
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const authorId = await getAuthorId();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, itemId } = await params;

  // Verify ownership via the book
  const existing = await prisma.bookDirectSaleItem.findFirst({
    where: { id: itemId, book: { id: bookId, authorId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { label, description, priceCents, isActive } = body;

  const updated = await prisma.bookDirectSaleItem.update({
    where: { id: itemId },
    data: {
      ...(label !== undefined && { label: label.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(priceCents !== undefined && { priceCents }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(updated);
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const authorId = await getAuthorId();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, itemId } = await params;

  const existing = await prisma.bookDirectSaleItem.findFirst({
    where: { id: itemId, book: { id: bookId, authorId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.bookDirectSaleItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
