import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { isStandardConnect } from "@/lib/stripe-connect";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

async function createOnboardingLink(accountId: string, authorId: string) {
  // Return + refresh URLs (back to the admin settings page)
  const baseUrl = `https://www.${PLATFORM_DOMAIN}`;
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/api/admin/stripe/connect?refresh=1`,
    return_url:  `${baseUrl}/api/admin/stripe/connect/return?authorId=${authorId}`,
    type: "account_onboarding",
  });
}

/**
 * POST /api/admin/stripe/connect
 *
 * Creates (or re-uses) the author's own Stripe (Standard) account and returns an
 * onboarding URL. Sales are charged directly on that account, so AuthorLoft never
 * holds the author's funds.
 *
 * Body: { country: "CY" } — required when a new account has to be created (the
 * country can't change afterwards); ignored when a Standard account already exists.
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
        slug: true,
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
        stripeConnectType: true,
      },
    });
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

    const body = await req.json().catch(() => null);
    const requestedCountry =
      typeof body?.country === "string" ? body.country.toUpperCase() : null;
    if (requestedCountry && !/^[A-Z]{2}$/.test(requestedCountry)) {
      return NextResponse.json({ error: "Invalid country." }, { status: 400 });
    }

    // Reuse existing account ID if already created
    let accountId = author.stripeConnectAccountId;

    // A legacy Express account that never finished onboarding (it was created in the
    // platform's country by default) is replaced by a Standard one in the author's country.
    // Onboarded Express accounts are left alone and keep working as before.
    if (accountId && !isStandardConnect(author) && !author.stripeConnectOnboarded) {
      if (!requestedCountry) {
        return NextResponse.json(
          { error: "Choose the country where your bank account is, then continue." },
          { status: 400 },
        );
      }
      await stripe.accounts.del(accountId);
      accountId = null;
      // Clear the stale ID now so a failure below can't leave it pointing at the deleted account
      await prisma.author.update({
        where: { id: authorId },
        data: { stripeConnectAccountId: null, stripeConnectOnboarded: false, stripeConnectType: null },
      });
    }

    if (!accountId) {
      // The country can't be changed on a Standard account, so never guess it.
      if (!requestedCountry) {
        return NextResponse.json(
          { error: "Choose the country where your bank account is, then continue." },
          { status: 400 },
        );
      }
      const account = await stripe.accounts.create({
        type: "standard",
        country: requestedCountry,
        email: author.email,
        metadata: { authorId: author.id, authorSlug: author.slug },
      });

      accountId = account.id;

      // Save the account ID immediately
      await prisma.author.update({
        where: { id: authorId },
        data: {
          stripeConnectAccountId: accountId,
          stripeConnectOnboarded: false,
          stripeConnectType: "standard",
        },
      });
    }

    const accountLink = await createOnboardingLink(accountId, authorId);
    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[stripe/connect] Error:", msg);
    return NextResponse.json({ error: `Failed to start Stripe Connect: ${msg}` }, { status: 500 });
  }
}

/**
 * GET /api/admin/stripe/connect?refresh=1
 *
 * Stripe sends authors here when an onboarding link has expired. Issue a fresh
 * link for their existing account and send them straight back into onboarding.
 */
export async function GET(_req: NextRequest) {
  const settingsUrl = `https://www.${PLATFORM_DOMAIN}/admin/settings`;
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.redirect(settingsUrl);

    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { stripeConnectAccountId: true },
    });
    if (!author?.stripeConnectAccountId) return NextResponse.redirect(settingsUrl);

    const accountLink = await createOnboardingLink(author.stripeConnectAccountId, authorId);
    return NextResponse.redirect(accountLink.url);
  } catch (err) {
    console.error("[stripe/connect] Refresh error:", err);
    return NextResponse.redirect(`${settingsUrl}?connect=error`);
  }
}
