import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { generateDownloadExpiry } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const { type, saleItemId } = session.metadata ?? {};

      if (type === "book_purchase") {
        // Find the pending order by Stripe session ID
        const order = await prisma.order.findFirst({
          where: { stripeSessionId: session.id },
          include: { items: true },
        });

        if (order) {
          // Mark order complete and record customer email + payment intent
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "COMPLETED",
              customerEmail: session.customer_email ?? session.customer_details?.email ?? "",
              stripePaymentIntentId: session.payment_intent,
            },
          });

          // Set download expiry and ensure fileKey is populated on each item
          for (const item of order.items) {
            // If fileKey wasn't captured at order creation, pull it from the sale item now
            let fileKey = item.fileKey;
            if (!fileKey && (saleItemId || item.saleItemId)) {
              const sid = item.saleItemId ?? saleItemId;
              const saleItem = await prisma.bookDirectSaleItem.findUnique({
                where: { id: sid },
                select: { fileKey: true },
              });
              fileKey = saleItem?.fileKey ?? null;
            }

            await prisma.orderItem.update({
              where: { id: item.id },
              data: {
                downloadExpiry: generateDownloadExpiry(48),
                ...(fileKey && !item.fileKey ? { fileKey } : {}),
              },
            });
          }
        }
      }

      if (type === "plan_subscription") {
        // Update author plan after subscription purchase
        const { authorId } = session.metadata ?? {};
        if (authorId && session.subscription) {
          await prisma.author.update({
            where: { id: authorId },
            data: { stripeSubscriptionId: session.subscription },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      // Downgrade author to Free plan when subscription is cancelled
      const subscription = event.data.object as any;
      await prisma.author.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { planId: null }, // null planId = Free
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
