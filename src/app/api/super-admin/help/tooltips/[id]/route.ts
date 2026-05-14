import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const tooltip = await prisma.helpTooltip.update({
    where: { id },
    data: {
      ...(data.tooltipKey   !== undefined && { tooltipKey:   data.tooltipKey.trim() }),
      ...(data.title        !== undefined && { title:        data.title.trim() }),
      ...(data.content      !== undefined && { content:      data.content.trim() }),
      ...(data.learnMoreUrl !== undefined && { learnMoreUrl: data.learnMoreUrl?.trim() || null }),
    },
  });
  return NextResponse.json(tooltip);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.helpTooltip.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
