import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

function isSuperAdmin(session: any) {
  return !!(session?.user as any)?.isSuperAdmin;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const existing = await prisma.courseCategory.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newSlug = slugify(name.trim());

  // Check slug uniqueness (excluding self)
  const conflict = await prisma.courseCategory.findFirst({
    where: { authorId: existing.authorId, slug: newSlug, parentId: existing.parentId, id: { not: id } },
  });
  const slug = conflict ? `${newSlug}-2` : newSlug;

  const updated = await prisma.courseCategory.update({
    where: { id },
    data: { name: name.trim(), slug },
    include: { children: true, _count: { select: { courses: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const category = await prisma.courseCategory.findUnique({
    where: { id },
    include: { _count: { select: { children: true, courses: true } } },
  });

  if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (category._count.children > 0)
    return NextResponse.json({ error: "Remove all sub-categories first before deleting this category." }, { status: 409 });

  if (category._count.courses > 0)
    return NextResponse.json({ error: `This category is used by ${category._count.courses} course(s) and cannot be deleted.` }, { status: 409 });

  await prisma.courseCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
