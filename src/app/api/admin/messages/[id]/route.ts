import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// PATCH /api/admin/messages/[id] — update a single message (isRead, isArchived)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  // Verify ownership
  const existing = await prisma.contactMessage.findFirst({
    where: { id, authorId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (typeof body.isRead === "boolean") data.isRead = body.isRead;
  if (typeof body.isArchived === "boolean") data.isArchived = body.isArchived;

  const updated = await prisma.contactMessage.update({
    where: { id },
    data,
    select: { id: true, isRead: true, isArchived: true },
  });

  return NextResponse.json(updated);
}

// DELETE /api/admin/messages/[id] — permanently delete
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  // Verify ownership before deleting
  const existing = await prisma.contactMessage.findFirst({
    where: { id, authorId },
    select: { id: true },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
