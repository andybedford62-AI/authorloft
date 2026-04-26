import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPlanCheckoutSession } from "@/lib/stripe";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

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

    const { priceId } = await req.json();
    if (!priceId) return NextResponse.json({ error: "priceId is required" }, { status: 400 });

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
      select: { email: true },
    });
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

    const base       = `https://www.${PLATFORM_DOMAIN}`;
    const successUrl = `${base}/admin/settings?subscribed=1`;
    const cancelUrl  = `${base}/admin/settings`;

    const session = await createPlanCheckoutSession({
      authorId,
      authorEmail: author.email,
      planPriceId: priceId,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[stripe/subscribe] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to start checkout." }, { status: 500 });
  }
}
