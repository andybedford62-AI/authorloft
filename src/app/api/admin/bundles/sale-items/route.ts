import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { toShippingCartItem } from "@/lib/shipping-server";

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
      shippingProfile: { include: { zones: { orderBy: { sortOrder: "asc" } } } },
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
      // PRINT editions only: the profile that prices their postage (null = none chosen yet)
      shippingProfile: i.format === "PRINT" ? toShippingCartItem(i).profile : undefined,
    }))
  );
}
