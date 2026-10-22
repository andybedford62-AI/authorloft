import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { sendOrderShippedEmail } from "@/lib/mailer";

// POST /api/admin/orders/[id]/ship
//   { carrier?, trackingNumber?, notify? }  -> mark the order shipped (and email the buyer unless notify === false)
//   { undo: true }                          -> clear the shipped record (e.g. marked by mistake)
// Only the selling author can do this, and only for orders that have a shipping address (print orders).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const order = await prisma.order.findFirst({
    where: { id, authorId, status: "COMPLETED" },
    include: {
      author: { select: { displayName: true, name: true } },
      items: { include: { book: { select: { title: true } }, saleItem: { select: { format: true, label: true } } } },
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (!order.shippingAddress) {
    return NextResponse.json({ error: "This order has nothing to ship." }, { status: 400 });
  }

  if (body.undo === true) {
    await prisma.order.update({
      where: { id: order.id },
      data: { shippedAt: null, trackingCarrier: null, trackingNumber: null },
    });
    return NextResponse.json({ ok: true });
  }

  const carrier = typeof body.carrier === "string" ? body.carrier.trim().slice(0, 60) : "";
  const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber.trim().slice(0, 100) : "";
  const firstShip = !order.shippedAt;

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      shippedAt: order.shippedAt ?? new Date(),
      trackingCarrier: carrier || null,
      trackingNumber: trackingNumber || null,
    },
    select: { shippedAt: true, trackingCarrier: true, trackingNumber: true },
  });

  // Email the buyer on the first "shipped" (or whenever tracking is added/changed and notify isn't switched off).
  const wantsEmail = body.notify !== false && !!order.customerEmail;
  const trackingChanged = (order.trackingNumber ?? "") !== trackingNumber || (order.trackingCarrier ?? "") !== carrier;
  if (wantsEmail && (firstShip || trackingChanged)) {
    const printTitles = order.items
      .filter((i) => i.saleItem?.format === "PRINT")
      .map((i) => `${i.book?.title ?? "Book"}${i.saleItem?.label ? ` (${i.saleItem.label})` : ""}`);
    sendOrderShippedEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      authorName: order.author.displayName || order.author.name,
      itemTitles: printTitles,
      carrier: carrier || null,
      trackingNumber: trackingNumber || null,
      orderId: order.id,
    }).catch((e) => console.error("[orders/ship] buyer email failed:", e));
  }

  return NextResponse.json({ ok: true, ...updated });
}
