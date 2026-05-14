import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const topic = await prisma.helpTopic.update({
    where: { id },
    data: {
      ...(data.title       !== undefined && { title:       data.title.trim() }),
      ...(data.slug        !== undefined && { slug:        data.slug.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.icon        !== undefined && { icon:        data.icon?.trim() || null }),
      ...(data.sortOrder   !== undefined && { sortOrder:   data.sortOrder }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
    },
  });
  return NextResponse.json(topic);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.helpTopic.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
