import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { pingIndexNow } from "@/lib/indexnow";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const guide = await prisma.guide.findUnique({ where: { id } });
  if (!guide) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(guide);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  if (!body.title?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  const existing = await prisma.guide.findUnique({ where: { id }, select: { isPublished: true, publishedAt: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wasPublished = existing.isPublished;
  const nowPublished = body.isPublished ?? false;

  try {
    const guide = await prisma.guide.update({
      where: { id },
      data: {
        title:           body.title.trim(),
        slug:            body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        excerpt:         body.excerpt?.trim() ?? "",
        content:         body.content?.trim() ?? "",
        coverImageUrl:   body.coverImageUrl || null,
        category:        body.category?.trim() ?? "",
        seoTitle:        body.seoTitle?.trim() || null,
        metaDescription: body.metaDescription?.trim() || null,
        focusKeyword:    body.focusKeyword?.trim() || null,
        faqsJson:        body.faqsJson || null,
        relatedSlugsJson: body.relatedSlugsJson || null,
        ctaTitle:        body.ctaTitle?.trim() || null,
        ctaDescription:  body.ctaDescription?.trim() || null,
        ctaButtonText:   body.ctaButtonText?.trim() || null,
        ctaButtonUrl:    body.ctaButtonUrl?.trim() || null,
        sortOrder:       body.sortOrder ?? 0,
        isPublished:     nowPublished,
        publishedAt:     nowPublished && !wasPublished ? new Date() : (nowPublished ? existing.publishedAt : null),
      },
    });

    if (guide.isPublished) {
      await pingIndexNow([`/guides/${guide.slug}`, "/guides"]);
    }

    return NextResponse.json(guide);
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "A guide with that slug already exists." }, { status: 400 });
    return NextResponse.json({ error: "Failed to update guide." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.guide.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
