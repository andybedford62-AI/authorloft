import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

/**
 * POST /api/checkout
 *
 * Creates a pending Order in the database, then starts a Stripe Checkout
 * session. Returns the Stripe-hosted payment page URL.
 *
 * Body: { saleItemId: string }
 * Returns: { url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { saleItemId, discountCode } = body;

    if (!saleItemId || typeof saleItemId !== "string") {
      return NextResponse.json({ error: "saleItemId is required" }, { status: 400 });
    }

    // Load the sale item with its book and author
    const saleItem = await prisma.bookDirectSaleItem.findUnique({
      where: { id: saleItemId },
      include: {
        book: {
          include: {
            author: {
              select: {
                id: true,
                slug: true,
                stripeConnectAccountId: true,
                stripeConnectOnboarded: true,
              },
            },
          },
        },
      },
    });

    if (!saleItem || !saleItem.isActive) {
      return NextResponse.json({ error: "This item is not available." }, { status: 404 });
    }

    const { book } = saleItem;
    const { author } = book;

    if (!book.isPublished || !book.directSalesEnabled) {
      return NextResponse.json({ error: "Direct sales are not enabled for this book." }, { status: 400 });
    }

    // Digital formats must have a file uploaded before purchase is allowed
    if (saleItem.format !== "PRINT" && !saleItem.fileKey) {
      return NextResponse.json(
        { error: "The download file for this item hasn't been uploaded yet. Please check back soon." },
        { status: 400 }
      );
    }

    if (saleItem.priceCents <= 0) {
      return NextResponse.json({ error: "Free items are not yet supported via this flow." }, { status: 400 });
    }

    // ── Apply discount code if provided ─────────────────────────────────────
    let discountCents   = 0;
    let discountCodeId: string | null = null;
    let finalPriceCents = saleItem.priceCents;

    if (discountCode && typeof discountCode === "string") {
      const discount = await prisma.discountCode.findUnique({
        where: {
          authorId_code: {
            authorId: author.id,
            code: discountCode.trim().toUpperCase(),
          },
        },
      });

      const isValid =
        discount &&
        discount.isActive &&
        (!discount.expiresAt || discount.expiresAt >= new Date()) &&
        (discount.maxUses === null || discount.usesCount < discount.maxUses) &&
        (!discount.bookId || discount.bookId === book.id);

      if (isValid && discount) {
        discountCodeId = discount.id;
        if (discount.type === "PERCENT") {
          discountCents = Math.round(saleItem.priceCents * (discount.value / 100));
        } else {
          discountCents = Math.min(discount.value, saleItem.priceCents);
        }
        finalPriceCents = Math.max(50, saleItem.priceCents - discountCents); // Stripe minimum 50¢
      }
    }

    // Build redirect URLs — stay on the author's subdomain
    const baseUrl = `https://${author.slug}.${PLATFORM_DOMAIN}`;
    const successUrl = `${baseUrl}/books/${book.slug}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${baseUrl}/books/${book.slug}/buy?item=${saleItemId}`;

    // Platform fee percentage (default 10% — set PLATFORM_FEE_PERCENT env var to override)
    const feePct = parseFloat(process.env.PLATFORM_FEE_PERCENT ?? "10") / 100;
    const platformFeeCents = Math.round(finalPriceCents * feePct);

    // Route payment through author's Stripe Connect account if fully onboarded
    const useConnect =
      !!author.stripeConnectAccountId && author.stripeConnectOnboarded;

    // Create Stripe Checkout session with automatic tax collection
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      // Collect billing address so Stripe Tax can calculate the correct rate
      billing_address_collection: "required",
      // Stripe Tax — automatically calculates sales tax / VAT / GST by location
      // Requires Stripe Tax to be enabled in your Stripe dashboard (Dashboard → Tax)
      automatic_tax: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: finalPriceCents,
            product_data: {
              name: `${book.title} — ${saleItem.label}`,
              ...(saleItem.description ? { description: saleItem.description } : {}),
              // Digital goods tax code — tells Stripe Tax this is an eBook/digital product
              tax_code: "txcd_10401100",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "book_purchase",
        bookId: book.id,
        saleItemId: saleItem.id,
        authorId: author.id,
      },
      success_url: successUrl,
      cancel_url:  cancelUrl,
      // If the author has a connected Stripe account, route funds there
      // and retain a platform fee. If not connected, payment goes to platform account.
      ...(useConnect && {
        payment_intent_data: {
          application_fee_amount: platformFeeCents,
          transfer_data: { destination: author.stripeConnectAccountId! },
        },
      }),
    });

    // Persist a PENDING order so the webhook can find and complete it
    await prisma.order.create({
      data: {
        authorId:       author.id,
        customerEmail:  "",           // filled in by webhook from session.customer_email
        totalCents:     finalPriceCents,
        discountCents,
        ...(discountCodeId && { discountCodeId }),
        stripeSessionId: session.id,
        status:         "PENDING",
        items: {
          create: {
            bookId:     book.id,
            saleItemId: saleItem.id,
            priceCents: finalPriceCents,
            fileKey:    saleItem.fileKey ?? null,
          },
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[checkout] Error:", msg);
    return NextResponse.json({ error: `Something went wrong: ${msg}` }, { status: 500 });
  }
}
