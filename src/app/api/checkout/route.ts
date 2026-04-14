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
    const { saleItemId } = body;

    if (!saleItemId || typeof saleItemId !== "string") {
      return NextResponse.json({ error: "saleItemId is required" }, { status: 400 });
    }

    // Load the sale item with its book and author
    const saleItem = await prisma.bookDirectSaleItem.findUnique({
      where: { id: saleItemId },
      include: {
        book: {
          include: {
            author: { select: { id: true, slug: true } },
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

    // Build redirect URLs — stay on the author's subdomain
    const baseUrl = `https://${author.slug}.${PLATFORM_DOMAIN}`;
    const successUrl = `${baseUrl}/books/${book.slug}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${baseUrl}/books/${book.slug}/buy?item=${saleItemId}`;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: saleItem.priceCents,
            product_data: {
              name: `${book.title} — ${saleItem.label}`,
              ...(saleItem.description ? { description: saleItem.description } : {}),
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
    });

    // Persist a PENDING order so the webhook can find and complete it
    await prisma.order.create({
      data: {
        authorId:       author.id,
        customerEmail:  "",           // filled in by webhook from session.customer_email
        totalCents:     saleItem.priceCents,
        stripeSessionId: session.id,
        status:         "PENDING",
        items: {
          create: {
            bookId:     book.id,
            saleItemId: saleItem.id,
            priceCents: saleItem.priceCents,
            fileKey:    saleItem.fileKey ?? null, // copy now so delivery works even if item is edited later
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
