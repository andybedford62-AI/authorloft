import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, slug, description, sortOrder, isActive } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  const finalSlug = slugify(slug?.trim() || name);
  if (!finalSlug) return NextResponse.json({ error: "Could not derive a valid slug from the name." }, { status: 400 });

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description?.trim() || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });
    return NextResponse.json(category);
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: `A category with slug "${finalSlug}" already exists for this type.` }, { status: 409 });
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH for quick inline toggles (e.g. isActive)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}
