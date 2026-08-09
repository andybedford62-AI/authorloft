import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { pingIndexNow } from "@/lib/indexnow";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const guides = await prisma.guide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, slug: true, category: true, isPublished: true,
      publishedAt: true, sortOrder: true, createdAt: true,
    },
  });
  return NextResponse.json(guides);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (!body.title?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
  }

  try {
    const guide = await prisma.guide.create({
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
        isPublished:     body.isPublished ?? false,
        publishedAt:     body.isPublished ? new Date() : null,
      },
    });

    if (guide.isPublished) {
      await pingIndexNow([`/guides/${guide.slug}`, "/guides"]);
    }

    return NextResponse.json(guide, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "A guide with that slug already exists." }, { status: 400 });
    return NextResponse.json({ error: "Failed to create guide." }, { status: 500 });
  }
}
