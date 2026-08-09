import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, category, description, websiteUrl, logoUrl, initials, avatarColor, isPartner, isActive, showOnHomepage, displayOrder } = await req.json();
  if (!name?.trim() || !websiteUrl?.trim()) return NextResponse.json({ error: "Name and website URL are required." }, { status: 400 });
  const resource = await prisma.platformResource.update({
    where: { id },
    data: {
      name:           name.trim(),
      category:       category?.trim()    ?? "",
      description:    description?.trim() ?? "",
      websiteUrl:     websiteUrl.trim(),
      logoUrl:        logoUrl?.trim()     || null,
      initials:       initials?.trim()    ?? "",
      avatarColor:    avatarColor?.trim() ?? "#1B2B47",
      isPartner:      isPartner      ?? false,
      isActive:       isActive       ?? true,
      showOnHomepage: showOnHomepage ?? false,
      displayOrder:   displayOrder   ?? 0,
    },
  });
  return NextResponse.json(resource);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.platformResource.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH for quick inline toggles
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const resource = await prisma.platformResource.update({ where: { id }, data });
  return NextResponse.json(resource);
}
