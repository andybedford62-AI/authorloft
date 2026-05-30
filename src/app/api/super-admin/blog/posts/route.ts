import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const posts = await prisma.platformPost.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, slug: true, category: true, isPublished: true,
      publishedAt: true, displayOrder: true, readTimeMinutes: true, createdAt: true,
    },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, slug, excerpt, content, coverImageUrl, category, authorName, readTimeMinutes, isPublished, attachmentUrl, attachmentLabel } = await req.json();

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const maxOrder = await prisma.platformPost.aggregate({ _max: { displayOrder: true } });

  const post = await prisma.platformPost.create({
    data: {
      title:           title.trim(),
      slug:            slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      excerpt:         excerpt?.trim() ?? "",
      content:         content?.trim() ?? "",
      coverImageUrl:   coverImageUrl || null,
      category:        category?.trim() ?? "",
      authorName:      authorName?.trim() || "AuthorLoft Team",
      readTimeMinutes: readTimeMinutes ?? 5,
      displayOrder:    (maxOrder._max.displayOrder ?? -1) + 1,
      isPublished:     isPublished ?? false,
      publishedAt:     isPublished ? new Date() : null,
      attachmentUrl:   attachmentUrl?.trim()   || null,
      attachmentLabel: attachmentLabel?.trim() || null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
