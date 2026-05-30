import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await prisma.platformPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { title, slug, excerpt, content, coverImageUrl, category, authorName, readTimeMinutes, isPublished, attachmentUrl, attachmentLabel } = await req.json();

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const existing = await prisma.platformPost.findUnique({ where: { id }, select: { isPublished: true, publishedAt: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wasPublished = existing.isPublished;
  const nowPublished = isPublished ?? false;

  const post = await prisma.platformPost.update({
    where: { id },
    data: {
      title:           title.trim(),
      slug:            slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      excerpt:         excerpt?.trim() ?? "",
      content:         content?.trim() ?? "",
      coverImageUrl:   coverImageUrl || null,
      category:        category?.trim() ?? "",
      authorName:      authorName?.trim() || "AuthorLoft Team",
      readTimeMinutes: readTimeMinutes ?? 5,
      isPublished:     nowPublished,
      publishedAt:     nowPublished && !wasPublished ? new Date() : (nowPublished ? existing.publishedAt : null),
      attachmentUrl:   attachmentUrl?.trim()   || null,
      attachmentLabel: attachmentLabel?.trim() || null,
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.platformPost.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
