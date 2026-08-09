import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const bundle = await prisma.bundle.findFirst({
    where: { id, authorId },
    include: {
      items: {
        include: { saleItem: { include: { book: { select: { title: true, coverImageUrl: true } } } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ bundle });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.bundle.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, coverImageUrl, priceCents, isPublished, saleItemIds } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = slugify(title);
  const slugConflict = await prisma.bundle.findFirst({
    where: { authorId, slug, NOT: { id } },
  });
  if (slugConflict) {
    return NextResponse.json({ error: "A bundle with this slug already exists" }, { status: 400 });
  }

  if (saleItemIds !== undefined) {
    const validItems = await prisma.bookDirectSaleItem.findMany({
      where: { id: { in: saleItemIds }, book: { authorId } },
      select: { id: true },
    });
    if (validItems.length !== saleItemIds.length) {
      return NextResponse.json({ error: "Some items are invalid" }, { status: 400 });
    }

    await prisma.bundleItem.deleteMany({ where: { bundleId: id } });
    await prisma.bundleItem.createMany({
      data: saleItemIds.map((sid: string, i: number) => ({
        bundleId: id,
        saleItemId: sid,
        sortOrder: i,
      })),
    });
  }

  const bundle = await prisma.bundle.update({
    where: { id },
    data: {
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      coverImageUrl: coverImageUrl !== undefined ? (coverImageUrl?.trim() || null) : existing.coverImageUrl,
      priceCents: priceCents ?? existing.priceCents,
      isPublished: isPublished ?? existing.isPublished,
    },
    include: {
      items: {
        include: { saleItem: { include: { book: { select: { title: true, coverImageUrl: true } } } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json({ bundle });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const bundle = await prisma.bundle.findFirst({ where: { id, authorId } });
  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.bundle.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
