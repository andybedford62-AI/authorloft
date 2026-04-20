import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, description } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: "Series name is required." }, { status: 400 });
  }

  const existing = await prisma.series.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slug = slugify(name);

  // Check slug uniqueness if changed
  if (slug !== existing.slug) {
    const conflict = await prisma.series.findUnique({
      where: { authorId_slug: { authorId, slug } },
    });
    if (conflict) {
      return NextResponse.json({ error: "A series with that name already exists." }, { status: 409 });
    }
  }

  const series = await prisma.series.update({
    where: { id },
    data: { name: name.trim(), slug, description: description || null },
  });

  return NextResponse.json(series);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.series.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Unlink books first (set seriesId to null rather than blocking)
  await prisma.book.updateMany({ where: { seriesId: id }, data: { seriesId: null } });
  await prisma.series.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
