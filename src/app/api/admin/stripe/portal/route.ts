import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

/**
 * POST /api/admin/stripe/portal
 * Creates a Stripe Customer Portal session and returns the redirect URL.
 */
export async function POST() {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const author = await prisma.author.findUnique({
      where:  { id: authorId },
      select: { stripeCustomerId: true, stripeSubscriptionId: true },
    });
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

    let customerId = author.stripeCustomerId;

    // If we don't have the customer ID stored, retrieve it from the subscription
    if (!customerId && author.stripeSubscriptionId) {
      const sub = await stripe.subscriptions.retrieve(author.stripeSubscriptionId);
      customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await prisma.author.update({
        where: { id: authorId },
        data:  { stripeCustomerId: customerId },
      });
    }

    if (!customerId) {
      return NextResponse.json({ error: "No billing account found." }, { status: 400 });
    }

    const returnUrl = `https://www.${PLATFORM_DOMAIN}/admin/settings`;

    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[stripe/portal] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to open billing portal." }, { status: 500 });
  }
}
