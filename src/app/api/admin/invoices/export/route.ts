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
    where: { authorId, status: "COMPLETED", createdAt: { gte: start, lt: end } },
    include: {
      items: {
        include: {
          book:     { select: { title: true } },
          saleItem: { select: { format: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const header = [
    "Date",
    "Order ID",
    "Customer Name",
    "Customer Email",
    "Books",
    "Formats",
    "Discount ($)",
    "Total ($)",
  ];

  const rows = orders.map((o) => {
    const date     = o.createdAt.toISOString().split("T")[0];
    const books    = o.items.map((i) => i.book?.title ?? "—").join("; ");
    const formats  = o.items.map((i) => i.saleItem?.format ?? "—").join("; ");
    const discount = (o.discountCents / 100).toFixed(2);
    const total    = (o.totalCents / 100).toFixed(2);

    return [date, o.id, o.customerName ?? "", o.customerEmail, books, formats, discount, total]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",");
  });

  // Totals row
  const grandTotal    = orders.reduce((s, o) => s + o.totalCents, 0);
  const grandDiscount = orders.reduce((s, o) => s + o.discountCents, 0);
  rows.push([
    `"TOTAL"`, `""`, `""`, `""`, `""`, `""`,
    `"${(grandDiscount / 100).toFixed(2)}"`,
    `"${(grandTotal / 100).toFixed(2)}"`,
  ].join(","));

  const csv      = [header.join(","), ...rows].join("\r\n");
  const filename = `authorloft-sales-${year}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
