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

  const existing = await prisma.genre.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newSlug = slugify(name.trim());

  // Check slug uniqueness (excluding self)
  const conflict = await prisma.genre.findFirst({
    where: { authorId: existing.authorId, slug: newSlug, parentId: existing.parentId, id: { not: id } },
  });
  const slug = conflict ? `${newSlug}-2` : newSlug;

  const updated = await prisma.genre.update({
    where: { id },
    data: { name: name.trim(), slug },
    include: { children: true, _count: { select: { books: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const genre = await prisma.genre.findUnique({
    where: { id },
    include: { _count: { select: { children: true, books: true } } },
  });

  if (!genre) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (genre._count.children > 0)
    return NextResponse.json({ error: "Remove all sub-genres first before deleting this genre." }, { status: 409 });

  if (genre._count.books > 0)
    return NextResponse.json({ error: `This genre is used by ${genre._count.books} book(s) and cannot be deleted.` }, { status: 409 });

  await prisma.genre.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
