import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

const VALID_CONTEXTS = ["book", "news", "topic"] as const;

function cleanArray(input: unknown, allowed?: readonly string[]): string[] {
  if (!Array.isArray(input)) return [];
  const arr = input.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
  return allowed ? arr.filter((s) => allowed.includes(s)) : arr;
}

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const promoTypes = await prisma.socialPromoType.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(promoTypes);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug, name, description, promptTemplate, applicableContexts, applicablePlatforms, isActive, sortOrder } = await req.json();
  if (!slug?.trim())            return NextResponse.json({ error: "Slug is required." },            { status: 400 });
  if (!name?.trim())            return NextResponse.json({ error: "Name is required." },            { status: 400 });
  if (!promptTemplate?.trim())  return NextResponse.json({ error: "Prompt template is required." }, { status: 400 });

  const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const existing = await prisma.socialPromoType.findUnique({ where: { slug: cleanSlug } });
  if (existing) return NextResponse.json({ error: "A promo type with that slug already exists." }, { status: 409 });

  const created = await prisma.socialPromoType.create({
    data: {
      slug:                cleanSlug,
      name:                name.trim(),
      description:         description?.trim() || "",
      promptTemplate:      promptTemplate.trim(),
      applicableContexts:  cleanArray(applicableContexts, VALID_CONTEXTS),
      applicablePlatforms: cleanArray(applicablePlatforms),
      isActive:            isActive ?? true,
      sortOrder:           sortOrder ?? 0,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
