import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  if (!b.title?.trim())    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  if (!b.fileUrl?.trim())  return NextResponse.json({ error: "A file URL is required." }, { status: 400 });
  if (!b.category?.trim()) return NextResponse.json({ error: "A category is required." }, { status: 400 });

  const slug = slugify(b.slug?.trim() || b.title);
  if (!slug) return NextResponse.json({ error: "Could not derive a valid slug." }, { status: 400 });

  const existing = await prisma.resourceDownload.findUnique({ where: { id }, select: { isPublished: true, publishedAt: true } });
  const willPublish = b.isPublished ?? true;

  try {
    const row = await prisma.resourceDownload.update({
      where: { id },
      data: {
        title:         b.title.trim(),
        slug,
        description:   b.description?.trim() || null,
        body:          b.body?.trim() || null,
        category:      b.category.trim(),
        fileUrl:       b.fileUrl.trim(),
        coverImageUrl: b.coverImageUrl?.trim() || null,
        requiresEmail: b.requiresEmail ?? true,
        isPublished:   willPublish,
        displayOrder:  b.displayOrder ?? 0,
        // stamp publishedAt the first time it goes public
        publishedAt:   willPublish ? (existing?.publishedAt ?? new Date()) : null,
      },
    });
    revalidatePath("/resources");
    return NextResponse.json(row);
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: `A download with slug "${slug}" already exists.` }, { status: 409 });
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.resourceDownload.delete({ where: { id } });
  revalidatePath("/resources");
  return NextResponse.json({ ok: true });
}

// PATCH for quick inline toggles (e.g. isPublished)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  if (data.isPublished === true) {
    const existing = await prisma.resourceDownload.findUnique({ where: { id }, select: { publishedAt: true } });
    if (!existing?.publishedAt) data.publishedAt = new Date();
  }
  const row = await prisma.resourceDownload.update({ where: { id }, data });
  revalidatePath("/resources");
  return NextResponse.json(row);
}
