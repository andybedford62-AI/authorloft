import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

const VALID_CONTEXTS = ["book", "news", "topic"] as const;

function cleanArray(input: unknown, allowed?: readonly string[]): string[] {
  if (!Array.isArray(input)) return [];
  const arr = input.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  return allowed ? arr.filter((s) => allowed.includes(s)) : arr;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, description, promptTemplate, applicableContexts, applicablePlatforms, isActive, sortOrder } = await req.json();
  const data: Record<string, unknown> = {};
  if (name                !== undefined) data.name                = name.trim();
  if (description         !== undefined) data.description         = description?.trim() || "";
  if (promptTemplate      !== undefined) data.promptTemplate      = promptTemplate.trim();
  if (applicableContexts  !== undefined) data.applicableContexts  = cleanArray(applicableContexts, VALID_CONTEXTS);
  if (applicablePlatforms !== undefined) data.applicablePlatforms = cleanArray(applicablePlatforms);
  if (isActive            !== undefined) data.isActive            = !!isActive;
  if (sortOrder           !== undefined) data.sortOrder           = sortOrder;
  data.updatedAt = new Date();
  const updated = await prisma.socialPromoType.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const refCount = await prisma.generatedSocialPost.count({ where: { promoTypeId: id } });
  if (refCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${refCount} generated posts reference this promo type. Toggle "Active" off instead.` },
      { status: 409 }
    );
  }
  await prisma.socialPromoType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
