import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, maxChars, hashtagStyle, promptAddendum, isPremiumOnly, isActive, sortOrder } = await req.json();
  const data: Record<string, unknown> = {};
  if (name           !== undefined) data.name           = name.trim();
  if (maxChars       !== undefined) data.maxChars       = maxChars;
  if (hashtagStyle   !== undefined) data.hashtagStyle   = (hashtagStyle === "inline" || hashtagStyle === "none") ? hashtagStyle : "trailing";
  if (promptAddendum !== undefined) data.promptAddendum = promptAddendum?.trim() || null;
  if (isPremiumOnly  !== undefined) data.isPremiumOnly  = !!isPremiumOnly;
  if (isActive       !== undefined) data.isActive       = !!isActive;
  if (sortOrder      !== undefined) data.sortOrder      = sortOrder;
  data.updatedAt = new Date();
  const updated = await prisma.socialPromotePlatform.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  // Block deletion if any generated posts reference this platform — soft-disable instead
  const refCount = await prisma.generatedSocialPost.count({ where: { platformId: id } });
  if (refCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${refCount} generated posts reference this platform. Toggle "Active" off instead.` },
      { status: 409 }
    );
  }
  await prisma.socialPromotePlatform.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
