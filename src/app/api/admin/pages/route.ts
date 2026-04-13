import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/pages — list all custom pages for this author
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const authorId = (session.user as any).id as string;

  const pages = await prisma.authorPage.findMany({
    where: { authorId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      navTitle: true,
      isVisible: true,
      showInNav: true,
      sortOrder: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(pages);
}

// POST /api/admin/pages — create a new custom page
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const authorId = (session.user as any).id as string;

  const body = await req.json();
  const { title, slug, navTitle, content, isPublished, showInNav, sortOrder } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!slug?.trim()) {
    return NextResponse.json({ error: "URL slug is required" }, { status: 400 });
  }

  // Validate slug format — lowercase letters, numbers, hyphens only
  const slugClean = slug.trim().toLowerCase().replace(/\s+/g, "-");
  if (!/^[a-z0-9-]+$/.test(slugClean)) {
    return NextResponse.json(
      { error: "Slug can only contain lowercase letters, numbers, and hyphens" },
      { status: 400 }
    );
  }

  // Reserved slugs that conflict with built-in routes
  const RESERVED = ["books", "about", "specials", "flip-books", "contact", "series", "buy", "api"];
  if (RESERVED.includes(slugClean)) {
    return NextResponse.json(
      { error: `"${slugClean}" is a reserved URL and cannot be used` },
      { status: 400 }
    );
  }

  // Check uniqueness
  const existing = await prisma.authorPage.findUnique({
    where: { authorId_slug: { authorId, slug: slugClean } },
  });
  if (existing) {
    return NextResponse.json({ error: "A page with this URL already exists" }, { status: 409 });
  }

  const page = await prisma.authorPage.create({
    data: {
      authorId,
      title: title.trim(),
      slug: slugClean,
      navTitle: navTitle?.trim() || null,
      content: content ?? null,
      isVisible: typeof isPublished === "boolean" ? isPublished : true,
      showInNav: typeof showInNav === "boolean" ? showInNav : true,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    },
  });

  return NextResponse.json(page, { status: 201 });
}
