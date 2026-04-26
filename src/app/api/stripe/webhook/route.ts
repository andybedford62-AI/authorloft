import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { generateDownloadExpiry } from "@/lib/stripe";
import { sendPurchaseConfirmationEmail, sendSaleNotificationEmail, sendRenewalReminderEmail } from "@/lib/mailer";
import { isThemeAllowed, BASE_THEME_IDS } from "@/lib/themes";

/**
 * Reverts the author's theme if their new plan no longer allows the current one.
 * - Genre palette on Standard → revert to baseTheme (last used base theme)
 * - Any non-Modern-Minimal on Free → force Modern Minimal
 */
async function revertThemeOnDowngrade(authorId: string, newPlanTier: string) {
  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { siteTheme: true, baseTheme: true },
  });
  if (!author) return;

  if (isThemeAllowed(author.siteTheme, newPlanTier)) return; // already valid

  // Determine the revert target
  let revertTo: string;
  if (newPlanTier === "FREE") {
    revertTo = "modern-minimal";
  } else {
    // STANDARD: genre palette → revert to saved baseTheme (or Classic Literary fallback)
    const candidateBase = author.baseTheme ?? "classic-literary";
    revertTo = BASE_THEME_IDS.includes(candidateBase as any) ? candidateBase : "classic-literary";
  }

  await prisma.author.update({
    where: { id: authorId },
    data:  { siteTheme: revertTo },
  });
}

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
                priceCents: true,
                saleItem: { select: { label: true } },
                book: {
                  select: {
                    title: true,
                    author: {
                      select: {
                        displayName: true,
                        name: true,
                        slug: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            });

            for (const fi of fullItems) {
              const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
              const authorSlug = fi.book.author.slug;
              const authorName = fi.book.author.displayName || fi.book.author.name;
              const authorEmail = fi.book.author.email;
              const downloadUrl = `https://${authorSlug}.${platformDomain}/api/orders/download/${fi.downloadToken}`;

              // 1. Buyer confirmation email with download link
              sendPurchaseConfirmationEmail({
                to:             customerEmail,
                customerName,
                bookTitle:      fi.book.title,
                itemLabel:      fi.saleItem?.label ?? "eBook",
                downloadUrl,
                downloadExpiry: expiry,
                authorName,
                authorSlug,
              }).catch((e) => console.error("[webhook] Failed to send buyer email:", e));

              // 2. Author sale notification email
              sendSaleNotificationEmail({
                to:            authorEmail,
                authorName,
                customerEmail,
                customerName,
                bookTitle:     fi.book.title,
                itemLabel:     fi.saleItem?.label ?? "eBook",
                priceCents:    fi.priceCents,
                orderId:       order.id,
              }).catch((e) => console.error("[webhook] Failed to send author notification:", e));
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
      // Subscription cancelled — downgrade author to Free plan
      const subscription = event.data.object as any;
      const affected = await prisma.author.findMany({
        where:  { stripeSubscriptionId: subscription.id },
        select: { id: true },
      });
      await prisma.author.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data:  { planId: null }, // null planId = Free
      });
      // Revert theme for each affected author
      for (const a of affected) {
        await revertThemeOnDowngrade(a.id, "FREE");
      }
      break;
    }

    case "customer.subscription.updated": {
      // Plan change — check if the new plan is a downgrade and revert theme if needed
      const subscription = event.data.object as any;
      const newPriceId   = subscription.items?.data?.[0]?.price?.id as string | undefined;

      // Persist billing period and reset reminder flag so the next cycle sends a fresh email
      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : undefined;
      if (periodEnd) {
        await prisma.authorSubscription.updateMany({
          where: {
            author: { stripeSubscriptionId: subscription.id },
          },
          data: {
            currentPeriodEnd:      periodEnd,
            currentPeriodStart:    subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000)
              : undefined,
            renewalReminderSentAt: null,
          },
        });
      }

      if (newPriceId) {
        const newPlan = await prisma.plan.findFirst({
          where:  { OR: [{ stripePriceId: newPriceId }, { stripePriceIdMonthly: newPriceId }, { stripePriceIdAnnual: newPriceId }] },
          select: { id: true, tier: true },
        });
        if (newPlan) {
          const affected = await prisma.author.findMany({
            where:  { stripeSubscriptionId: subscription.id },
            select: { id: true },
          });
          await prisma.author.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data:  { planId: newPlan.id },
          });
          for (const a of affected) {
            await revertThemeOnDowngrade(a.id, newPlan.tier);
          }
        }
      }
      break;
    }

    case "invoice.upcoming": {
      // Stripe fires this ~30 days before renewal — send one reminder email per cycle
      const invoice      = event.data.object as any;
      const subId        = invoice.subscription as string | undefined;
      if (!subId) break;

      const author = await prisma.author.findFirst({
        where:  { stripeSubscriptionId: subId },
        select: { id: true, email: true, name: true, displayName: true },
      });
      if (!author) break;

      const sub = await prisma.authorSubscription.findUnique({
        where:  { authorId: author.id },
        select: { renewalReminderSentAt: true, currentPeriodEnd: true },
      });
      if (!sub || sub.renewalReminderSentAt) break; // already sent this cycle

      const renewalDate = sub.currentPeriodEnd
        ?? (invoice.period_end ? new Date(invoice.period_end * 1000) : null);
      const amountCents = invoice.amount_due as number ?? 0;

      sendRenewalReminderEmail({
        to:          author.email,
        authorName:  author.displayName || author.name,
        renewalDate: renewalDate ?? new Date(),
        amountCents,
      }).catch((e) => console.error("[webhook] Failed to send renewal reminder:", e));

      await prisma.authorSubscription.update({
        where: { authorId: author.id },
        data:  { renewalReminderSentAt: new Date() },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
