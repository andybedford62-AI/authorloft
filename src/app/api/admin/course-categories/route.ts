import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

// Course Categories are ONE shared, platform-wide list — every author's
// course-category picker reads it unscoped (see courses/new/page.tsx,
// courses/[id]/edit/page.tsx). Management is Super Admin-only so the taxonomy
// stays curated rather than fragmenting into one list per author.
// See docs/CHANGELOG.md Aug 17 2026.
function isSuperAdmin(session: any) {
  return !!(session?.user as any)?.isSuperAdmin;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Fetch all categories flat, then build tree in JS to avoid nested _count issues
  const all = await prisma.courseCategory.findMany({
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
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // authorId is a required column on CourseCategory, so new rows still need
  // one — it's vestigial for this shared-list model (nothing reads/filters by
  // it), kept only to satisfy the schema.
  const authorId = (session!.user as any).id as string;
  const { name, parentId } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const baseSlug = slugify(name.trim());

  // Ensure slug is unique within same parent scope
  let slug = baseSlug;
  let attempt = 2;
  while (await prisma.courseCategory.findFirst({ where: { slug, parentId: parentId || null } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  const maxOrder = await prisma.courseCategory.aggregate({
    where: { parentId: parentId || null },
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
