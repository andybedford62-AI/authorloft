import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { generateDownloadExpiry } from "@/lib/stripe";
import { sendPurchaseConfirmationEmail } from "@/lib/mailer";

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
          const customerEmail = session.customer_email ?? session.customer_details?.email ?? "";
          const customerName  = session.customer_details?.name ?? undefined;

          // Mark order complete and record customer email + payment intent
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "COMPLETED",
              customerEmail,
              stripePaymentIntentId: session.payment_intent,
            },
          });

          // Set download expiry and ensure fileKey is populated on each item
          const expiry = generateDownloadExpiry(48);
          for (const item of order.items) {
            // If fileKey wasn't captured at order creation, pull it from the sale item now
            let fileKey = item.fileKey;
            if (!fileKey && (saleItemId || item.saleItemId)) {
              const sid = item.saleItemId ?? saleItemId;
              const si = await prisma.bookDirectSaleItem.findUnique({
                where: { id: sid },
                select: { fileKey: true },
              });
              fileKey = si?.fileKey ?? null;
            }

            await prisma.orderItem.update({
              where: { id: item.id },
              data: {
                downloadExpiry: expiry,
                ...(fileKey && !item.fileKey ? { fileKey } : {}),
              },
            });
          }

          // Send purchase confirmation email with download link(s)
          if (customerEmail) {
            // Load the full order items with book + author + saleItem details for the email
            const fullItems = await prisma.orderItem.findMany({
              where: { orderId: order.id },
              select: {
                downloadToken: true,
                saleItem: { select: { label: true } },
                book: {
                  select: {
                    title: true,
                    author: { select: { displayName: true, name: true, slug: true } },
                  },
                },
              },
            });

            for (const fi of fullItems) {
              const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
              const authorSlug = fi.book.author.slug;
              const downloadUrl = `https://${authorSlug}.${platformDomain}/api/orders/download/${fi.downloadToken}`;

              // Fire-and-forget — don't let email failure break the webhook response
              sendPurchaseConfirmationEmail({
                to:             customerEmail,
                customerName,
                bookTitle:      fi.book.title,
                itemLabel:      fi.saleItem?.label ?? "eBook",
                downloadUrl,
                downloadExpiry: expiry,
                authorName:     fi.book.author.displayName || fi.book.author.name,
                authorSlug,
              }).catch((e) => console.error("[webhook] Failed to send confirmation email:", e));
            }
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
