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
      const { bookId, type } = session.metadata;

      if (type === "book_purchase") {
        // Find the pending order and mark complete
        const order = await prisma.order.findFirst({
          where: { stripeSessionId: session.id },
          include: { items: true },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "COMPLETED",
              customerEmail: session.customer_email,
              stripePaymentIntentId: session.payment_intent,
            },
          });

          // Set download expiry on all items
          for (const item of order.items) {
            await prisma.orderItem.update({
              where: { id: item.id },
              data: { downloadExpiry: generateDownloadExpiry(48) },
            });
          }
        }
      }

      if (type === "plan_subscription") {
        // Update author plan
        const { authorId } = session.metadata;
        // Look up which plan corresponds to this subscription price
        // and update the author record
        // (Full implementation: match session.subscription to plan tier)
      }
      break;
    }

    case "customer.subscription.deleted": {
      // Downgrade author to Free plan
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
