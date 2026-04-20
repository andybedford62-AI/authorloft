import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

async function getPage(authorId: string, id: string) {
  return prisma.authorPage.findFirst({
    where: { id, authorId },
  });
}

// GET /api/admin/pages/[id] — fetch a single page for editing
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const page = await getPage(authorId, id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

// PUT /api/admin/pages/[id] — update a page
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await getPage(authorId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, slug, navTitle, content, isPublished, isVisible: isVisibleBody, showInNav, sortOrder } = body;

  // Resolve the visibility value — accept either `isPublished` (from PageForm)
  // or `isVisible` (from PagesListClient toggle)
  const resolvedIsVisible =
    typeof isPublished === "boolean" ? isPublished :
    typeof isVisibleBody === "boolean" ? isVisibleBody :
    undefined;

  if (title !== undefined && !title?.trim()) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  let slugClean = existing.slug;
  if (slug !== undefined) {
    slugClean = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!/^[a-z0-9-]+$/.test(slugClean)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }
    const RESERVED = ["books", "about", "specials", "flip-books", "contact", "series", "buy", "api"];
    if (RESERVED.includes(slugClean)) {
      return NextResponse.json(
        { error: `"${slugClean}" is a reserved URL and cannot be used` },
        { status: 400 }
      );
    }
    // Check uniqueness only if slug is actually changing
    if (slugClean !== existing.slug) {
      const conflict = await prisma.authorPage.findUnique({
        where: { authorId_slug: { authorId, slug: slugClean } },
      });
      if (conflict) {
        return NextResponse.json({ error: "A page with this URL already exists" }, { status: 409 });
      }
    }
  }

  const updated = await prisma.authorPage.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(slug !== undefined && { slug: slugClean }),
      ...(navTitle !== undefined && { navTitle: navTitle?.trim() || null }),
      ...(content !== undefined && { content }),
      ...(resolvedIsVisible !== undefined && { isVisible: resolvedIsVisible }),
      ...(typeof showInNav === "boolean" && { showInNav }),
      ...(typeof sortOrder === "number" && { sortOrder }),
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/admin/pages/[id] — delete a page
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await getPage(authorId, id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.authorPage.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
