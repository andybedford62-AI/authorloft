import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// GET /api/admin/blog/[id] — fetch a single post
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const post = await prisma.post.findFirst({ where: { id, authorId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(post);
}

// PATCH /api/admin/blog/[id] — update a post
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const post = await prisma.post.findFirst({ where: { id, authorId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, slug, excerpt, content, coverImageUrl, isPublished } = body;

  if (title !== undefined && !title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let slugClean = post.slug;
  if (slug !== undefined) {
    slugClean = slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!/^[a-z0-9-]+$/.test(slugClean)) {
      return NextResponse.json(
        { error: "Slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }
    // Check collision only if slug changed
    if (slugClean !== post.slug) {
      const collision = await prisma.post.findFirst({ where: { authorId, slug: slugClean } });
      if (collision) {
        return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
      }
    }
  }

  // If publishing for the first time, stamp the publishedAt date
  const publishedAt =
    isPublished && !post.publishedAt ? new Date()
    : !isPublished ? null
    : post.publishedAt;

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      slug: slugClean,
      ...(excerpt !== undefined && { excerpt: excerpt?.trim() || null }),
      ...(content !== undefined && { content: content?.trim() || null }),
      ...(coverImageUrl !== undefined && { coverImageUrl: coverImageUrl?.trim() || null }),
      ...(isPublished !== undefined && { isPublished }),
      publishedAt,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/admin/blog/[id] — delete a post
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const post = await prisma.post.findFirst({ where: { id, authorId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
