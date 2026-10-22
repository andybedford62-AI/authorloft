import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { isStandardConnect } from "@/lib/stripe-connect";

// Pending orders older than this are abandoned checkouts: Stripe expires a Checkout Session after
// 24 hours, so a PENDING order this old normally can never be paid.
const ABANDONED_AFTER_DAYS = 30;
const BATCH_SIZE = 200;

/**
 * GET /api/cron/cleanup-abandoned-orders
 * Called by Vercel Cron nightly (see vercel.json).
 *
 * Deletes PENDING orders (and, by cascade, their items) older than ABANDONED_AFTER_DAYS.
 * Never touches COMPLETED, REFUNDED or FAILED orders.
 *
 * Safety: a PENDING order is not always abandoned. If a payment succeeded but its webhook never
 * landed, the order is also stuck PENDING, and deleting it would erase the only record of a paid
 * sale. So each candidate's Checkout Session is checked with Stripe first, and an order is deleted
 * only when Stripe confirms the session was not paid. Anything paid, or that can't be checked, is
 * kept and logged as an error so it gets looked at.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - ABANDONED_AFTER_DAYS * 24 * 60 * 60 * 1000);
  const candidates = await prisma.order.findMany({
    where: { status: "PENDING", createdAt: { lt: cutoff } },
    orderBy: { createdAt: "asc" },
    take: BATCH_SIZE,
    select: {
      id: true,
      stripeSessionId: true,
      author: { select: { stripeConnectAccountId: true, stripeConnectType: true } },
    },
  });

  const deleteIds: string[] = [];
  const keptPaid: string[] = [];
  const keptUnchecked: string[] = [];

  for (const order of candidates) {
    if (!order.stripeSessionId) {
      deleteIds.push(order.id); // never reached Stripe
      continue;
    }
    const options: Stripe.RequestOptions | undefined =
      isStandardConnect(order.author) && order.author.stripeConnectAccountId
        ? { stripeAccount: order.author.stripeConnectAccountId }
        : undefined;
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId, undefined, options);
      if (session.payment_status === "paid" || session.status === "complete") keptPaid.push(order.id);
      else deleteIds.push(order.id);
    } catch {
      keptUnchecked.push(order.id);
    }
  }

  const result = deleteIds.length
    ? await prisma.order.deleteMany({ where: { id: { in: deleteIds }, status: "PENDING" } })
    : { count: 0 };

  if (keptPaid.length) {
    console.error(`[cron/cleanup-abandoned-orders] ${keptPaid.length} PENDING order(s) were PAID in Stripe but never completed (webhook problem?). Kept: ${keptPaid.join(", ")}`);
  }
  if (keptUnchecked.length) {
    console.warn(`[cron/cleanup-abandoned-orders] Could not check ${keptUnchecked.length} order(s) with Stripe; kept.`);
  }
  console.log(`[cron/cleanup-abandoned-orders] Deleted ${result.count} abandoned checkouts`);

  return NextResponse.json({
    ok: true,
    deleted: result.count,
    keptPaid: keptPaid.length,
    keptUnchecked: keptUnchecked.length,
  });
}
