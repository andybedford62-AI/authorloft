import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch this author's categories flat, then build tree in JS to avoid nested _count issues
  const all = await prisma.courseCategory.findMany({
    where: { authorId },
    include: { _count: { select: { courses: true } } },
    orderBy: { sortOrder: "asc" },
  });

  type Flat = typeof all[0] & { children: Flat[] };
  const map = new Map<string, Flat>();
  all.forEach((c) => map.set(c.id, { ...c, children: [] }));

  const roots: Flat[] = [];
  map.forEach((c) => {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(c);
    } else if (!c.parentId) {
      roots.push(c);
    }
  });

  return NextResponse.json(roots);
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, parentId } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // A parent category id must belong to this author too — otherwise an author
  // could nest a new category under another author's category by guessing its id.
  if (parentId) {
    const parent = await prisma.courseCategory.findUnique({ where: { id: parentId }, select: { authorId: true } });
    if (!parent || parent.authorId !== authorId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const baseSlug = slugify(name.trim());

  // Ensure slug is unique within same parent scope
  let slug = baseSlug;
  let attempt = 2;
  while (await prisma.courseCategory.findFirst({ where: { authorId, slug, parentId: parentId || null } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  const maxOrder = await prisma.courseCategory.aggregate({
    where: { authorId, parentId: parentId || null },
    _max: { sortOrder: true },
  });

  const category = await prisma.courseCategory.create({
    data: {
      name: name.trim(),
      slug,
      authorId,
      parentId: parentId || null,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
    include: { children: true, _count: { select: { courses: true } } },
  });

  return NextResponse.json(category, { status: 201 });
}
