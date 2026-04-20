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

  const special = await prisma.special.findFirst({ where: { id, authorId } });
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
  const { title, description, imageUrl, imageKey, ctaLabel, ctaUrl, startsAt, endsAt, isActive } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  // If image was replaced and old one was in Supabase, delete the old one
  if (
    imageKey &&
    existing.imageUrl &&
    imageUrl !== existing.imageUrl
  ) {
    // Try to extract the storage key from the old URL if it was a Supabase upload
    // imageKey from body is the new key; we can't reliably get the old key, so skip deletion here.
    // Deletion is handled explicitly when the user removes the image.
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
    },
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
