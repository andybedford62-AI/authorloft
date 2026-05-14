import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { label, email, description, isActive, sortOrder } = await req.json();
  const data: Record<string, unknown> = {};
  if (label !== undefined)       data.label       = label.trim();
  if (email !== undefined)       data.email       = email.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (isActive !== undefined)    data.isActive    = isActive;
  if (sortOrder !== undefined)   data.sortOrder   = sortOrder;
  const updated = await prisma.supportEmail.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.supportEmail.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
