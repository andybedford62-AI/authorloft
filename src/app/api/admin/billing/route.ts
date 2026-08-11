import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

/**
 * GET /api/admin/billing
 * Returns the author's current plan + all available paid plans with price IDs.
 */
export async function GET() {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [author, plans, earlyBirdOffer] = await Promise.all([
      prisma.author.findUnique({
        where:  { id: authorId },
        select: {
          plan:                  { select: { tier: true, name: true } },
          subscription:          { select: { currentPeriodEnd: true, billingInterval: true, status: true } },
          stripeSubscriptionId:  true,
          stripeCustomerId:      true,
          trialEndsAt:           true,
          trialPlan:             { select: { name: true } },
          createdAt:             true,
          assignedCouponId:      true,
        },
      }),
      prisma.plan.findMany({
        where:   { isActive: true, tier: { not: "FREE" } },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true, name: true, tier: true, description: true,
          monthlyPriceCents: true, annualPriceCents: true,
          stripePriceIdMonthly: true, stripePriceIdAnnual: true,
          featuresJson: true, badgeColor: true, featuredLabel: true,
        },
      }),
      prisma.earlyBirdOffer.findFirst({
        where:  { enabled: true },
        select: { percentOff: true, durationMonths: true, windowDays: true, headline: true, subtext: true },
      }),
    ]);

    const tier = author?.plan?.tier ?? "FREE";
    const hasStripeSubscription = !!author?.stripeSubscriptionId;
    const isAdminAssigned = tier !== "FREE" && !hasStripeSubscription;
    const trialEndsAt    = author?.trialEndsAt ?? null;
    const isOnTrial      = !!trialEndsAt && trialEndsAt > new Date();

    // Same eligibility rule as /api/admin/stripe/subscribe: no existing subscription,
    // no per-author assigned coupon, within the offer's signup window.
    let foundingOffer: { percentOff: number; headline: string; subtext: string; daysLeft: number } | null = null;
    if (earlyBirdOffer && !hasStripeSubscription && !author?.assignedCouponId && author?.createdAt) {
      const daysSinceSignup = (Date.now() - new Date(author.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceSignup <= earlyBirdOffer.windowDays) {
        const daysLeft = Math.max(0, Math.ceil(earlyBirdOffer.windowDays - daysSinceSignup));
        const headline = earlyBirdOffer.headline?.trim()
          || `Founding member offer — ${earlyBirdOffer.percentOff}% off for your first ${earlyBirdOffer.durationMonths} month${earlyBirdOffer.durationMonths === 1 ? "" : "s"}`;
        const subtext = earlyBirdOffer.subtext?.trim()
          || `Applied automatically at checkout — ${daysLeft} day${daysLeft === 1 ? "" : "s"} left to lock it in.`;
        foundingOffer = { percentOff: earlyBirdOffer.percentOff, headline, subtext, daysLeft };
      }
    }

    return NextResponse.json({
      currentTier:      tier,
      currentPlanName:  author?.plan?.name ?? "Free",
      subscription:     author?.subscription ?? null,
      isAdminAssigned,
      isOnTrial,
      trialEndsAt:      trialEndsAt?.toISOString() ?? null,
      plans,
      foundingOffer,
    });
  } catch (err: any) {
    console.error("[billing] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to load billing info." }, { status: 500 });
  }
}
