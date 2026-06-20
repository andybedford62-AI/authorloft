import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const platforms = await prisma.socialPromotePlatform.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(platforms);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, name, maxChars, hashtagStyle, promptAddendum, isPremiumOnly, isActive, sortOrder } = await req.json();
  if (!slug?.trim())  return NextResponse.json({ error: "Slug is required." },  { status: 400 });
  if (!name?.trim())  return NextResponse.json({ error: "Name is required." },  { status: 400 });
  if (typeof maxChars !== "number" || maxChars < 1) {
    return NextResponse.json({ error: "Max chars must be a positive number." }, { status: 400 });
  }
  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const existing = await prisma.socialPromotePlatform.findUnique({ where: { slug: cleanSlug } });
  if (existing) return NextResponse.json({ error: "A platform with that slug already exists." }, { status: 409 });
  const created = await prisma.socialPromotePlatform.create({
    data: {
      slug:           cleanSlug,
      name:           name.trim(),
      maxChars,
      hashtagStyle:   hashtagStyle === "inline" || hashtagStyle === "none" ? hashtagStyle : "trailing",
      promptAddendum: promptAddendum?.trim() || null,
      isPremiumOnly:  !!isPremiumOnly,
      isActive:       isActive ?? true,
      sortOrder:      sortOrder ?? 0,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
