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

  // Fetch all genres flat, then build tree in JS to avoid nested _count issues
  const all = await prisma.genre.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { sortOrder: "asc" },
  });

  type Flat = typeof all[0] & { children: Flat[] };
  const map = new Map<string, Flat>();
  all.forEach((g) => map.set(g.id, { ...g, children: [] }));

  const roots: Flat[] = [];
  map.forEach((g) => {
    if (g.parentId && map.has(g.parentId)) {
      map.get(g.parentId)!.children.push(g);
    } else if (!g.parentId) {
      roots.push(g);
    }
  });

  return NextResponse.json(roots);
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
