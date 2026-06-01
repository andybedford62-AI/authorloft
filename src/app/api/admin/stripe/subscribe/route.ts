import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSubscriptionCheckoutSession, stripe } from "@/lib/stripe";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { validateSubscriptionCheckout } from "@/lib/schemas/subscription";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

/**
 * POST /api/admin/stripe/subscribe
 * Body: { priceId: string }
 * Creates a Stripe subscription checkout session and returns { url }.
 */
export async function POST(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ── Rate Limiting ──────────────────────────────────────────────────────
    const rateLimitResult = await checkRateLimit(
      `user:${authorId}:subscribe`,
      RATE_LIMITS.subscribe
    );

    if (!rateLimitResult.allowed) {
      console.warn("[subscribe] Rate limit exceeded:", { authorId });
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetAt - Date.now()) / 1000
            ).toString(),
            "RateLimit-Limit": rateLimitResult.limit.toString(),
            "RateLimit-Remaining": "0",
            "RateLimit-Reset": Math.floor(rateLimitResult.resetAt / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();

    // ── Input Validation ───────────────────────────────────────────────────
    const validationResult = validateSubscriptionCheckout(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid subscription request",
          details: validationResult.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { priceId } = validationResult.data;

    // Verify the price ID belongs to a real plan
    const plan = await prisma.plan.findFirst({
      where: {
        OR: [
          { stripePriceIdMonthly: priceId },
          { stripePriceIdAnnual:  priceId },
        ],
      },
      select: { id: true, name: true },
    });
    if (!plan) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

    const author = await prisma.author.findUnique({
      where:  { id: authorId },
      select: { email: true, stripeSubscriptionId: true, stripeCustomerId: true, createdAt: true },
    });
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

    // If author already has an active subscription, send them to the Customer Portal
    // to upgrade/downgrade rather than creating a second subscription
    if (author.stripeSubscriptionId) {
      let customerId = author.stripeCustomerId;
      if (!customerId) {
        const sub = await stripe.subscriptions.retrieve(author.stripeSubscriptionId);
        customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await prisma.author.update({ where: { id: authorId }, data: { stripeCustomerId: customerId } });
      }
      const portal = await stripe.billingPortal.sessions.create({
        customer:   customerId,
        return_url: `https://www.${PLATFORM_DOMAIN}/admin/settings`,
      });
      return NextResponse.json({ url: portal.url });
    }

    const base       = `https://www.${PLATFORM_DOMAIN}`;
    const successUrl = `${base}/admin/settings?subscribed=1`;
    const cancelUrl  = `${base}/admin/settings`;

    // Early bird discount — within 30 days of account creation
    const daysSinceSignup = (Date.now() - new Date(author.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const isEarlyBird = daysSinceSignup <= 30;

    // Determine if the selected price is monthly or annual
    const selectedPlan = await prisma.plan.findFirst({
      where: {
        OR: [
          { stripePriceIdMonthly: priceId },
          { stripePriceIdAnnual:  priceId },
        ],
      },
      select: { stripePriceIdMonthly: true },
    });
    const isMonthly = selectedPlan?.stripePriceIdMonthly === priceId;

    const earlyBirdCouponId = isEarlyBird
      ? (isMonthly
          ? process.env.STRIPE_EARLY_BIRD_COUPON_MONTHLY
          : process.env.STRIPE_EARLY_BIRD_COUPON_ANNUAL)
      : undefined;

    const session = await createSubscriptionCheckoutSession({
      authorId,
      authorEmail: author.email,
      planPriceId: priceId,
      successUrl,
      cancelUrl,
      existingCustomerId: author.stripeCustomerId || undefined,
      earlyBirdCouponId,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[stripe/subscribe] FULL_ERROR:", JSON.stringify({
      message: err?.message,
      type: err?.type,
      code: err?.code,
      param: err?.param,
      statusCode: err?.statusCode,
    }));
    // TEMP DEBUG — remove before going live
    return NextResponse.json({
      error: "Failed to start checkout.",
      _debug: { message: err?.message, type: err?.type, code: err?.code, param: err?.param },
    }, { status: 500 });
  }
}
