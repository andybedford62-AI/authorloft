import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromSupabaseStorage } from "@/lib/supabase-storage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

// ─── GET /api/admin/specials/[id] ─────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const special = await prisma.special.findFirst({
    where: { id, authorId },
    include: { discountCode: { select: { id: true, code: true, type: true, value: true } } },
  });
  if (!special) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ special });
}

// ─── PUT /api/admin/specials/[id] ─────────────────────────────────────────────

export async function PUT(req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.special.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, imageUrl, imageKey, ctaLabel, ctaUrl, startsAt, endsAt, isActive, discountCodeId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  // Validate discount code belongs to this author if provided
  if (discountCodeId) {
    const code = await prisma.discountCode.findFirst({ where: { id: discountCodeId, authorId } });
    if (!code) return NextResponse.json({ error: "Discount code not found" }, { status: 404 });
  }

  const special = await prisma.special.update({
    where: { id },
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl !== undefined ? (imageUrl?.trim() || null) : existing.imageUrl,
      ctaLabel: ctaLabel?.trim() || null,
      ctaUrl: ctaUrl?.trim() || null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      isActive: isActive ?? existing.isActive,
      discountCodeId: discountCodeId !== undefined ? (discountCodeId || null) : existing.discountCodeId,
    },
    include: { discountCode: { select: { id: true, code: true, type: true, value: true } } },
  });

  return NextResponse.json({ special });
}

// ─── DELETE /api/admin/specials/[id] ──────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const special = await prisma.special.findFirst({ where: { id, authorId } });
  if (!special) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.special.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
