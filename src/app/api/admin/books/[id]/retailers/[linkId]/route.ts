import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

type RouteParams = { params: Promise<{ id: string; linkId: string }> };

/** Verify the link belongs to a book owned by the current author */
async function verifyOwnership(bookId: string, linkId: string, authorId: string) {
  const link = await prisma.bookRetailerLink.findFirst({
    where: { id: linkId, bookId },
    include: { book: { select: { authorId: true } } },
  });
  if (!link || link.book.authorId !== authorId) return null;
  return link;
}

// ── PATCH — activate / deactivate (toggle isActive) ──────────────────────────
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, linkId } = await params;

  const link = await verifyOwnership(bookId, linkId, authorId);
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  // Accept explicit isActive boolean OR a label/url update
  const data: Record<string, unknown> = {};
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.label === "string" && body.label.trim()) data.label = body.label.trim();
  if (typeof body.url === "string" && body.url.trim()) data.url = body.url.trim();

  const updated = await prisma.bookRetailerLink.update({
    where: { id: linkId },
    data,
  });

  return NextResponse.json(updated);
}

// ── DELETE — remove the link entirely ────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, linkId } = await params;

  const link = await verifyOwnership(bookId, linkId, authorId);
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.bookRetailerLink.delete({ where: { id: linkId } });
  return new NextResponse(null, { status: 204 });
}
