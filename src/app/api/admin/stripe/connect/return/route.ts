import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

/**
 * GET /api/admin/stripe/connect/return?authorId=xxx
 *
 * Stripe redirects here after the author completes (or exits) onboarding.
 * We check the account status and mark stripeConnectOnboarded = true if ready.
 * Then redirect back to the admin settings page.
 */
export async function GET(req: NextRequest) {
  const authorId = req.nextUrl.searchParams.get("authorId");
  if (!authorId) {
    return NextResponse.redirect(`https://www.${PLATFORM_DOMAIN}/admin/settings?connect=error`);
  }

  try {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { stripeConnectAccountId: true },
    });

    if (author?.stripeConnectAccountId) {
      // Check if Stripe account has completed onboarding
      const account = await stripe.accounts.retrieve(author.stripeConnectAccountId);
      const onboarded = account.details_submitted && !account.requirements?.currently_due?.length;

      await prisma.author.update({
        where: { id: authorId },
        data: { stripeConnectOnboarded: !!onboarded },
      });
    }
  } catch (err) {
    console.error("[stripe/connect/return] Error:", err);
  }

  // Always redirect back to settings — status widget will show current state
  return NextResponse.redirect(
    `https://www.${PLATFORM_DOMAIN}/admin/settings?connect=done`
  );
}
