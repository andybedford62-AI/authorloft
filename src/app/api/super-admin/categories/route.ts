import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

const TYPES = ["blog", "resource", "faq", "news"] as const;
type CatType = (typeof TYPES)[number];

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const type = req.nextUrl.searchParams.get("type");
  const where = type && TYPES.includes(type as CatType)
    ? { type, isActive: true }
    : { isActive: true };
  const categories = await prisma.category.findMany({
    where,
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, name, slug, description, sortOrder, isActive } = await req.json();
  if (!TYPES.includes(type)) return NextResponse.json({ error: "Invalid category type." }, { status: 400 });
  if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const finalSlug = slugify(slug?.trim() || name);
  if (!finalSlug) return NextResponse.json({ error: "Could not derive a valid slug from the name." }, { status: 400 });

  const max = await prisma.category.aggregate({ where: { type }, _max: { sortOrder: true } });
  try {
    const category = await prisma.category.create({
      data: {
        type,
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        sortOrder: sortOrder ?? (max._max.sortOrder ?? -1) + 1,
        isActive: isActive ?? true,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: `A "${type}" category with slug "${finalSlug}" already exists.` }, { status: 409 });
    throw e;
  }
}
