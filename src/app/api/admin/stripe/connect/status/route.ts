import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

/**
 * GET /api/admin/stripe/connect/status
 *
 * Returns the current Stripe Connect status for the logged-in author.
 */
export async function GET(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { stripeConnectAccountId: true, stripeConnectOnboarded: true },
    });

    if (!author?.stripeConnectAccountId) {
      return NextResponse.json({ status: "not_connected" });
    }

    // Re-verify with Stripe in case requirements changed
    try {
      const account = await stripe.accounts.retrieve(author.stripeConnectAccountId);
      const onboarded = !!(account.details_submitted && !account.requirements?.currently_due?.length);

      // Sync DB if status changed
      if (onboarded !== author.stripeConnectOnboarded) {
        await prisma.author.update({
          where: { id: authorId },
          data: { stripeConnectOnboarded: onboarded },
        });
      }

      return NextResponse.json({
        status: onboarded ? "active" : "pending",
        accountId: author.stripeConnectAccountId,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirementsDue: account.requirements?.currently_due ?? [],
      });
    } catch {
      // If Stripe call fails, return DB state
      return NextResponse.json({
        status: author.stripeConnectOnboarded ? "active" : "pending",
        accountId: author.stripeConnectAccountId,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
