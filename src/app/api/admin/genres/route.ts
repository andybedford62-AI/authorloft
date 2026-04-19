import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

function isSuperAdmin(session: any) {
  return !!(session?.user as any)?.isSuperAdmin;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const genres = await prisma.genre.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: { children: { include: { children: true, _count: { select: { books: true } } }, _count: { select: { books: true } } } },
        orderBy: { sortOrder: "asc" },
        _count: { select: { books: true } },
      },
      _count: { select: { books: true } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(genres);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const authorId = (session!.user as any).id as string;
  const { name, parentId } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const baseSlug = slugify(name.trim());

  // Ensure slug is unique within same parent scope
  let slug = baseSlug;
  let attempt = 2;
  while (await prisma.genre.findFirst({ where: { authorId, slug, parentId: parentId || null } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  const maxOrder = await prisma.genre.aggregate({
    where: { authorId, parentId: parentId || null },
    _max: { sortOrder: true },
  });

  const genre = await prisma.genre.create({
    data: {
      name: name.trim(),
      slug,
      authorId,
      parentId: parentId || null,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
    include: { children: true, _count: { select: { books: true } } },
  });

  return NextResponse.json(genre, { status: 201 });
}
