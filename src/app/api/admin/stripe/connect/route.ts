import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

/**
 * POST /api/admin/stripe/connect
 *
 * Creates (or re-uses) a Stripe Express connected account for the author
 * and returns an onboarding URL to redirect them to Stripe.
 */
export async function POST(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
      },
    });
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

    // Reuse existing account ID if already created
    let accountId = author.stripeConnectAccountId;

    if (!accountId) {
      // Create a new Stripe Express account
      const account = await stripe.accounts.create({
        type: "express",
        email: author.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { authorId: author.id, authorSlug: author.slug },
      });

      accountId = account.id;

      // Save the account ID immediately
      await prisma.author.update({
        where: { id: authorId },
        data: { stripeConnectAccountId: accountId, stripeConnectOnboarded: false },
      });
    }

    // Build the return + refresh URLs (back to the admin settings page)
    const baseUrl = `https://www.${PLATFORM_DOMAIN}`;
    const returnUrl  = `${baseUrl}/api/admin/stripe/connect/return?authorId=${authorId}`;
    const refreshUrl = `${baseUrl}/api/admin/stripe/connect?refresh=1`;

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url:  returnUrl,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[stripe/connect] Error:", msg);
    return NextResponse.json({ error: `Failed to start Stripe Connect: ${msg}` }, { status: 500 });
  }
}
