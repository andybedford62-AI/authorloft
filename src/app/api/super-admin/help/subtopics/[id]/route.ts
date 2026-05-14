import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const subtopic = await prisma.helpSubtopic.update({
    where: { id },
    data: {
      ...(data.title     !== undefined && { title:     data.title.trim() }),
      ...(data.slug      !== undefined && { slug:      data.slug.trim() }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });
  return NextResponse.json(subtopic);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.helpSubtopic.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
