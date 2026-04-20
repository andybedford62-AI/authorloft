import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canPublishPost } from "@/lib/plan-limits";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// GET /api/admin/blog — list all posts for this author
export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.post.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(posts);
}

// POST /api/admin/blog — create a new post
export async function POST(req: Request) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, slug, excerpt, content, coverImageUrl, isPublished } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!slug?.trim()) {
    return NextResponse.json({ error: "URL slug is required" }, { status: 400 });
  }

  const slugClean = slug.trim().toLowerCase().replace(/\s+/g, "-");
  if (!/^[a-z0-9-]+$/.test(slugClean)) {
    return NextResponse.json(
      { error: "Slug can only contain lowercase letters, numbers, and hyphens" },
      { status: 400 }
    );
  }

  // Check for slug collision
  const existing = await prisma.post.findFirst({ where: { authorId, slug: slugClean } });
  if (existing) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }

  // Plan limit: only check when publishing immediately
  if (isPublished) {
    const postCheck = await canPublishPost(authorId);
    if (!postCheck.allowed) {
      return NextResponse.json({ error: postCheck.reason }, { status: 403 });
    }
  }

  const post = await prisma.post.create({
    data: {
      authorId,
      title: title.trim(),
      slug: slugClean,
      excerpt: excerpt?.trim() || null,
      content: content?.trim() || null,
      coverImageUrl: coverImageUrl?.trim() || null,
      isPublished: isPublished ?? false,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
