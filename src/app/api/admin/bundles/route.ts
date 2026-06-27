import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bundles = await prisma.bundle.findMany({
    where: { authorId },
    include: {
      items: {
        include: { saleItem: { include: { book: { select: { title: true, coverImageUrl: true } } } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ bundles });
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, coverImageUrl, priceCents, isPublished, saleItemIds } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = slugify(title);
  const existing = await prisma.bundle.findUnique({ where: { authorId_slug: { authorId, slug } } });
  if (existing) {
    return NextResponse.json({ error: "A bundle with this slug already exists" }, { status: 400 });
  }

  if (!saleItemIds?.length) {
    return NextResponse.json({ error: "A bundle needs at least 2 items" }, { status: 400 });
  }

  const validItems = await prisma.bookDirectSaleItem.findMany({
    where: { id: { in: saleItemIds }, book: { authorId } },
    select: { id: true },
  });
  if (validItems.length !== saleItemIds.length) {
    return NextResponse.json({ error: "Some items are invalid" }, { status: 400 });
  }

  const bundle = await prisma.bundle.create({
    data: {
      authorId,
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      coverImageUrl: coverImageUrl?.trim() || null,
      priceCents: priceCents ?? 0,
      isPublished: isPublished ?? false,
      items: {
        create: saleItemIds.map((id: string, i: number) => ({
          saleItemId: id,
          sortOrder: i,
        })),
      },
    },
    include: {
      items: {
        include: { saleItem: { include: { book: { select: { title: true, coverImageUrl: true } } } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json({ bundle }, { status: 201 });
}
