import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/orders/tokens
 *
 * Returns download tokens for a completed order. Requires both the
 * Stripe session ID and the buyer's email address to match — prevents
 * token harvesting from anyone who only observed the session ID in a URL.
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, email } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      select: {
        status: true,
        customerEmail: true,
        items: {
          select: {
            downloadToken: true,
            downloadExpiry: true,
            saleItem: { select: { label: true } },
            book: { select: { slug: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json({ error: "Email does not match order" }, { status: 403 });
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json({ error: "Order not completed" }, { status: 400 });
    }

    return NextResponse.json({
      tokens: order.items.map((item) => ({
        downloadToken:  item.downloadToken,
        downloadExpiry: item.downloadExpiry,
        label:          item.saleItem?.label ?? "Download",
        bookSlug:       item.book?.slug ?? "",
      })),
    });
  } catch (err) {
    console.error("[orders/tokens] POST error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
