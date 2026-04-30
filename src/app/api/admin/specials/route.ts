import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// ─── GET /api/admin/specials ──────────────────────────────────────────────────
// List all specials for the logged-in author

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const specials = await prisma.special.findMany({
    where: { authorId },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({ specials });
}

// ─── POST /api/admin/specials ─────────────────────────────────────────────────
// Create a new special

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const { title, description, imageUrl, ctaLabel, ctaUrl, startsAt, endsAt, isActive, discountCodeId } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Validate date range if both provided
  if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  // Validate discount code belongs to this author if provided
  if (discountCodeId) {
    const code = await prisma.discountCode.findFirst({ where: { id: discountCodeId, authorId } });
    if (!code) return NextResponse.json({ error: "Discount code not found" }, { status: 404 });
  }

  const special = await prisma.special.create({
    data: {
      authorId,
      title: title.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      ctaLabel: ctaLabel?.trim() || null,
      ctaUrl: ctaUrl?.trim() || null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      isActive: isActive ?? true,
      discountCodeId: discountCodeId || null,
    },
    include: { discountCode: { select: { id: true, code: true, type: true, value: true } } },
  });

  return NextResponse.json({ special }, { status: 201 });
}
