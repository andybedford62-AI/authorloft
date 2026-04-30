import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

function capturePostHog(distinctId: string, event: string, properties: Record<string, unknown>) {
  const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (!key) return;
  fetch(`${host}/capture/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ api_key: key, distinct_id: distinctId, event, properties }),
  }).catch(() => {});
}
import { prisma } from "@/lib/db";
import { generateDownloadExpiry } from "@/lib/stripe";
import { sendPurchaseConfirmationEmail, sendSaleNotificationEmail, sendRenewalReminderEmail, sendSubscriptionWelcomeEmail, sendPaymentFailedEmail } from "@/lib/mailer";
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
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  // Deduplicate — Stripe retries on any non-2xx, so guard against double-processing
  try {
    await prisma.stripeEvent.create({ data: { id: event.id } });
  } catch {
    // Unique constraint violation = already processed
    return NextResponse.json({ received: true });
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

          // Increment discount code usage count if one was applied
          if (order.discountCodeId) {
            await prisma.discountCode.update({
              where: { id: order.discountCodeId },
              data: { usesCount: { increment: 1 } },
            }).catch((err) => console.error("[webhook] discountCode increment error:", err));
          }

          // Set download expiry and ensure fileKey is populated on each item.
          // Pre-fetch all missing sale items in one query to avoid N+1.
          const expiry = generateDownloadExpiry(48);
          const missingSaleItemIds = [
            ...new Set(
              order.items
                .filter((item) => !item.fileKey && (saleItemId || item.saleItemId))
                .map((item) => item.saleItemId ?? saleItemId)
                .filter(Boolean) as string[]
            ),
          ];
          const saleItemFileKeys = new Map<string, string | null>();
          if (missingSaleItemIds.length > 0) {
            const fetched = await prisma.bookDirectSaleItem.findMany({
              where:  { id: { in: missingSaleItemIds } },
              select: { id: true, fileKey: true },
            });
            for (const si of fetched) saleItemFileKeys.set(si.id, si.fileKey);
          }

          await Promise.all(
            order.items.map((item) => {
              let fileKey = item.fileKey;
              if (!fileKey && (saleItemId || item.saleItemId)) {
                const sid = item.saleItemId ?? saleItemId;
                fileKey = saleItemFileKeys.get(sid!) ?? null;
              }
              return prisma.orderItem.update({
                where: { id: item.id },
                data: {
                  downloadExpiry: expiry,
                  ...(fileKey && !item.fileKey ? { fileKey } : {}),
                },
              });
            })
          );

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
        const { authorId } = session.metadata ?? {};
        if (authorId && session.subscription) {
          // Persist the subscription ID and customer ID on the author
          await prisma.author.update({
            where: { id: authorId },
            data: {
              stripeSubscriptionId: session.subscription,
              ...(session.customer ? { stripeCustomerId: session.customer } : {}),
            },
          });

          // Fetch full subscription from Stripe to get billing period + plan
          try {
            const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
            const priceId   = stripeSub.items.data[0]?.price?.id;
            const plan      = priceId
              ? await prisma.plan.findFirst({
                  where:  { OR: [{ stripePriceId: priceId }, { stripePriceIdMonthly: priceId }, { stripePriceIdAnnual: priceId }] },
                  select: { id: true },
                })
              : null;

            const sub = stripeSub as any;
            const periodStart = sub.current_period_start
              ? new Date(sub.current_period_start * 1000) : null;
            const periodEnd   = sub.current_period_end
              ? new Date(sub.current_period_end * 1000) : null;
            const interval    = stripeSub.items.data[0]?.price?.recurring?.interval === "year"
              ? "annual" : "monthly";

            if (plan) {
              await prisma.authorSubscription.upsert({
                where:  { authorId },
                create: {
                  authorId,
                  planId:             plan.id,
                  status:             "active",
                  billingInterval:    interval,
                  currentPeriodStart: periodStart,
                  currentPeriodEnd:   periodEnd,
                },
                update: {
                  planId:               plan.id,
                  status:               "active",
                  billingInterval:      interval,
                  currentPeriodStart:   periodStart,
                  currentPeriodEnd:     periodEnd,
                  renewalReminderSentAt: null,
                },
              });

              // Also update Author.planId to the new plan
              await prisma.author.update({
                where: { id: authorId },
                data:  { planId: plan.id },
              });

              // Send welcome email — fetch author + plan in parallel
              const [authorRecord, planRecord] = await Promise.all([
                prisma.author.findUnique({
                  where:  { id: authorId },
                  select: { email: true, name: true, displayName: true },
                }),
                prisma.plan.findUnique({
                  where:  { id: plan.id },
                  select: { name: true, monthlyPriceCents: true, annualPriceCents: true },
                }),
              ]);

              // Analytics: track plan upgrade (fires after planRecord is available)
              capturePostHog(authorId, "upgraded_to_paid", {
                plan:     planRecord?.name ?? "paid",
                interval,
              });

              if (authorRecord && planRecord) {
                const amountCents = interval === "annual"
                  ? planRecord.annualPriceCents
                  : planRecord.monthlyPriceCents;
                sendSubscriptionWelcomeEmail({
                  to:             authorRecord.email,
                  authorName:     authorRecord.displayName || authorRecord.name,
                  planName:       planRecord.name,
                  billingInterval: interval,
                  amountCents,
                }).catch((e) => console.error("[webhook] Failed to send welcome email:", e));
              }
            }
          } catch (e) {
            console.error("[webhook] Failed to upsert AuthorSubscription:", e);
          }
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
        data:  { planId: null, heroLayout: "portrait" }, // revert to free defaults
      });
      // Remove AuthorSubscription rows in one batch, then revert themes in parallel
      await prisma.authorSubscription.deleteMany({
        where: { authorId: { in: affected.map((a) => a.id) } },
      });
      await Promise.all(affected.map((a) => revertThemeOnDowngrade(a.id, "FREE")));
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
          // Keep AuthorSubscription.planId in sync with the new plan (batch + parallel)
          await prisma.authorSubscription.updateMany({
            where: { authorId: { in: affected.map((a) => a.id) } },
            data:  { planId: newPlan.id },
          });
          await Promise.all(affected.map((a) => revertThemeOnDowngrade(a.id, newPlan.tier)));
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

    case "invoice.payment_failed": {
      const invoice = event.data.object as any;
      const subId   = invoice.subscription as string | undefined;
      if (!subId) break;

      const author = await prisma.author.findFirst({
        where:  { stripeSubscriptionId: subId },
        select: { email: true, name: true, displayName: true },
      });
      if (!author) break;

      const amountCents = invoice.amount_due as number ?? 0;
      const nextRetry   = invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000)
        : null;

      sendPaymentFailedEmail({
        to:          author.email,
        authorName:  author.displayName || author.name,
        amountCents,
        nextRetryDate: nextRetry,
      }).catch((e) => console.error("[webhook] Failed to send payment failed email:", e));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
