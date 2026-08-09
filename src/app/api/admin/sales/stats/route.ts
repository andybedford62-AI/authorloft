import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// GET /api/admin/sales/stats?period=30|90|365
export async function GET(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = new URL(req.url).searchParams.get("period");
  const days = raw === "90" ? 90 : raw === "365" ? 365 : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [orders, orderItems] = await Promise.all([
    prisma.order.findMany({
      where: { authorId, status: "COMPLETED", createdAt: { gte: since } },
      select: { totalCents: true, createdAt: true },
    }),
    prisma.orderItem.findMany({
      where: {
        order: { authorId, status: "COMPLETED", createdAt: { gte: since } },
      },
      select: {
        priceCents: true,
        book:     { select: { title: true } },
        saleItem: { select: { format: true } },
      },
    }),
  ]);

  // Revenue by day
  const byDayMap: Record<string, number> = {};
  for (const o of orders) {
    const key = o.createdAt.toISOString().split("T")[0];
    byDayMap[key] = (byDayMap[key] ?? 0) + o.totalCents;
  }
  // Fill every day in the range so chart has no gaps
  const revenueByDay: { date: string; totalCents: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    revenueByDay.push({ date: key, totalCents: byDayMap[key] ?? 0 });
  }

  // Revenue by book (top 10)
  const byBookMap: Record<string, number> = {};
  for (const item of orderItems) {
    const title = item.book?.title ?? "Unknown";
    byBookMap[title] = (byBookMap[title] ?? 0) + item.priceCents;
  }
  const revenueByBook = Object.entries(byBookMap)
    .map(([bookTitle, totalCents]) => ({ bookTitle, totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents)
    .slice(0, 10);

  // Revenue by format
  const byFormatMap: Record<string, number> = {};
  for (const item of orderItems) {
    const fmt = item.saleItem?.format ?? "OTHER";
    byFormatMap[fmt] = (byFormatMap[fmt] ?? 0) + item.priceCents;
  }
  const revenueByFormat = Object.entries(byFormatMap)
    .map(([format, totalCents]) => ({ format, totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents);

  return NextResponse.json({ revenueByDay, revenueByBook, revenueByFormat });
}
