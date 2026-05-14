import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/orders/status?session_id=cs_xxx
 *
 * Polled by the success page to check if the Stripe webhook has
 * marked the order as COMPLETED. Returns order metadata only — no
 * download tokens. Tokens are gated behind POST /api/orders/tokens
 * which requires email verification.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    select: {
      status: true,
      customerEmail: true,
      items: {
        select: {
          downloadCount: true,
          maxDownloads: true,
          fileKey: true,
          saleItem: {
            select: { label: true, format: true, fileName: true },
          },
          book: {
            select: { title: true, slug: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: order.status,
    customerEmail: order.customerEmail,
    items: order.items.map((item) => ({
      downloadsLeft: item.maxDownloads - item.downloadCount,
      hasFile:       !!item.fileKey,
      label:         item.saleItem?.label ?? "Download",
      format:        item.saleItem?.format ?? "EBOOK",
      fileName:      item.saleItem?.fileName ?? item.book.slug,
      bookTitle:     item.book.title,
      bookSlug:      item.book.slug,
    })),
  });
}
