import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resources = await prisma.platformResource.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, category, description, websiteUrl, logoUrl, initials, avatarColor, isPartner, isActive, showOnHomepage, displayOrder } = await req.json();
  if (!name?.trim() || !websiteUrl?.trim()) return NextResponse.json({ error: "Name and website URL are required." }, { status: 400 });
  const max = await prisma.platformResource.aggregate({ _max: { displayOrder: true } });
  const resource = await prisma.platformResource.create({
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
      displayOrder:   displayOrder   ?? (max._max.displayOrder ?? -1) + 1,
    },
  });
  return NextResponse.json(resource, { status: 201 });
}
