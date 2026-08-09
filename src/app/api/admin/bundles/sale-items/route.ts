import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.bookDirectSaleItem.findMany({
    where: { book: { authorId }, isActive: true },
    select: {
      id: true,
      format: true,
      label: true,
      priceCents: true,
      book: { select: { title: true, coverImageUrl: true } },
    },
    orderBy: [{ book: { title: "asc" } }, { sortOrder: "asc" }],
  });

  return NextResponse.json(
    items.map((i) => ({
      id: i.id,
      format: i.format,
      label: i.label,
      priceCents: i.priceCents,
      bookTitle: i.book.title,
      bookCoverUrl: i.book.coverImageUrl,
    }))
  );
}
