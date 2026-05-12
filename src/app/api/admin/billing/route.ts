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

    const [author, plans] = await Promise.all([
      prisma.author.findUnique({
        where:  { id: authorId },
        select: {
          plan:                  { select: { tier: true, name: true } },
          subscription:          { select: { currentPeriodEnd: true, billingInterval: true, status: true } },
          stripeSubscriptionId:  true,
          stripeCustomerId:      true,
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
    ]);

    const tier = author?.plan?.tier ?? "FREE";
    const hasStripeSubscription = !!author?.stripeSubscriptionId;
    const isAdminAssigned = tier !== "FREE" && !hasStripeSubscription;

    return NextResponse.json({
      currentTier:      tier,
      currentPlanName:  author?.plan?.name ?? "Free",
      subscription:     author?.subscription ?? null,
      isAdminAssigned,
      plans,
    });
  } catch (err: any) {
    console.error("[billing] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to load billing info." }, { status: 500 });
  }
}
