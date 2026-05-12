import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const yearParam = req.nextUrl.searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  const start = new Date(year, 0, 1);
  const end   = new Date(year + 1, 0, 1);

  const orders = await prisma.order.findMany({
    where: {
      authorId,
      status: "COMPLETED",
      createdAt: { gte: start, lt: end },
    },
    include: {
      items: {
        include: {
          book:     { select: { title: true } },
          saleItem: { select: { formatType: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCents    = orders.reduce((s, o) => s + o.totalCents, 0);
  const discountCents = orders.reduce((s, o) => s + o.discountCents, 0);

  // Gather all years that have completed orders for the year-tab list
  const yearGroups = await prisma.order.groupBy({
    by: ["createdAt"],
    where: { authorId, status: "COMPLETED" },
  });
  const availableYears = [
    ...new Set(yearGroups.map((o) => new Date(o.createdAt).getFullYear())),
  ].sort((a, b) => b - a);
  if (!availableYears.includes(new Date().getFullYear())) {
    availableYears.unshift(new Date().getFullYear());
  }

  return NextResponse.json({
    year,
    availableYears,
    stats: {
      totalCents,
      discountCents,
      orderCount: orders.length,
      avgCents: orders.length ? Math.round(totalCents / orders.length) : 0,
    },
    orders: orders.map((o) => ({
      id:            o.id,
      createdAt:     o.createdAt,
      customerName:  o.customerName ?? "—",
      customerEmail: o.customerEmail,
      totalCents:    o.totalCents,
      discountCents: o.discountCents,
      items: o.items.map((i) => ({
        title:  i.book.title,
        format: i.saleItem?.formatType ?? "—",
        cents:  i.priceCents,
      })),
    })),
  });
}
