import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { calcDiscount } from "@/lib/discount-queries";

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

/**
 * POST /api/checkout
 *
 * Creates a pending Order and starts a Stripe Checkout session.
 * Returns the Stripe-hosted payment page URL.
 *
 * Body: { items: [{ saleItemId: string }], discountCode?: string }
 *   or legacy: { saleItemId: string, discountCode?: string }
 * Returns: { url: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both new cart format and legacy single-item format
    let saleItemIds: string[];
    if (Array.isArray(body.items) && body.items.length > 0) {
      saleItemIds = body.items.map((i: { saleItemId: string }) => i.saleItemId).filter(Boolean);
    } else if (typeof body.saleItemId === "string") {
      saleItemIds = [body.saleItemId];
    } else {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    if (saleItemIds.length === 0) {
      return NextResponse.json({ error: "No items provided." }, { status: 400 });
    }

    const { discountCode } = body;

    // Load all sale items with their books and author
    const saleItems = await prisma.bookDirectSaleItem.findMany({
      where: { id: { in: saleItemIds }, isActive: true },
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

    if (saleItems.length === 0) {
      return NextResponse.json({ error: "No valid items found." }, { status: 404 });
    }

    // All items must belong to the same author (single checkout session)
    const authorId = saleItems[0].book.author.id;
    if (saleItems.some((i) => i.book.author.id !== authorId)) {
      return NextResponse.json({ error: "All items must be from the same author." }, { status: 400 });
    }

    const author = saleItems[0].book.author;

    // Validate each item
    for (const item of saleItems) {
      if (!item.book.isPublished || !item.book.directSalesEnabled) {
        return NextResponse.json(
          { error: `Direct sales are not enabled for "${item.book.title}".` },
          { status: 400 }
        );
      }
      if (item.format !== "PRINT" && !item.fileKey) {
        return NextResponse.json(
          { error: `The download file for "${item.label}" hasn't been uploaded yet. Please check back soon.` },
          { status: 400 }
        );
      }
      if (item.priceCents <= 0) {
        return NextResponse.json(
          { error: `Free items are not yet supported via this flow.` },
          { status: 400 }
        );
      }
    }

    // ── Resolve discount code ─────────────────────────────────────────────────
    type DiscountWithBooks = {
      id: string;
      type: string;
      value: number;
      isActive: boolean;
      expiresAt: Date | null;
      maxUses: number | null;
      usesCount: number;
      books: { bookId: string }[];
    };

    let discount: DiscountWithBooks | null = null;

    if (discountCode && typeof discountCode === "string") {
      const found = await prisma.discountCode.findUnique({
        where: {
          authorId_code: {
            authorId,
            code: discountCode.trim().toUpperCase(),
          },
        },
        include: { books: { select: { bookId: true } } },
      });

      const isValid =
        found &&
        found.isActive &&
        (!found.expiresAt || found.expiresAt >= new Date()) &&
        (found.maxUses === null || found.usesCount < found.maxUses);

      if (isValid && found) discount = found;
    }

    // ── Calculate per-item price after discount ───────────────────────────────
    const lineItems = saleItems.map((item) => {
      let itemPrice = item.priceCents;
      let itemDiscount = 0;

      if (discount) {
        const restrictedBookIds = discount.books.map((b) => b.bookId);
        const bookAllowed =
          restrictedBookIds.length === 0 || restrictedBookIds.includes(item.book.id);

        if (bookAllowed) {
          const calc = calcDiscount(item.priceCents, discount.type, discount.value);
          itemDiscount = calc.discountCents;
          itemPrice    = Math.max(50, calc.finalPriceCents);
        }
      }

      return { item, itemPrice, itemDiscount };
    });

    const totalCents    = lineItems.reduce((s, l) => s + l.itemPrice, 0);
    const discountCents = lineItems.reduce((s, l) => s + l.itemDiscount, 0);
    const discountCodeId = discount ? discount.id : null;

    // Build redirect URLs from the first item's book (or use author slug directly)
    const baseUrl    = `https://${author.slug}.${PLATFORM_DOMAIN}`;
    const successUrl = `${baseUrl}/cart/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${baseUrl}/books`;

    const feePct           = parseFloat(process.env.PLATFORM_FEE_PERCENT ?? "10") / 100;
    const platformFeeCents = Math.round(totalCents * feePct);
    const useConnect       = !!author.stripeConnectAccountId && author.stripeConnectOnboarded;

    // Build Stripe line items
    const stripeLineItems = lineItems.map(({ item, itemPrice }) => ({
      price_data: {
        currency:     "usd",
        unit_amount:  itemPrice,
        product_data: {
          name:     `${item.book.title} — ${item.label}`,
          ...(item.description ? { description: item.description } : {}),
          tax_code: "txcd_10401100",
        },
      },
      quantity: 1,
    }));

    // Include all saleItemIds in metadata (comma-separated for webhook)
    const session = await stripe.checkout.sessions.create({
      payment_method_types:     ["card"],
      mode:                     "payment",
      billing_address_collection: "required",
      automatic_tax:            { enabled: true },
      line_items:               stripeLineItems,
      metadata: {
        type:        "book_purchase",
        authorId,
        saleItemIds: saleItemIds.join(","),
        // Keep single saleItemId for backward-compat webhook (first item)
        saleItemId:  saleItemIds[0],
        bookId:      saleItems[0].book.id,
      },
      success_url: successUrl,
      cancel_url:  cancelUrl,
      ...(useConnect && {
        payment_intent_data: {
          application_fee_amount: platformFeeCents,
          transfer_data: { destination: author.stripeConnectAccountId! },
        },
      }),
    });

    // Create PENDING order with all items
    await prisma.order.create({
      data: {
        authorId,
        customerEmail:   "",
        totalCents,
        discountCents,
        ...(discountCodeId && { discountCodeId }),
        stripeSessionId: session.id,
        status:          "PENDING",
        items: {
          create: lineItems.map(({ item, itemPrice }) => ({
            bookId:     item.book.id,
            saleItemId: item.id,
            priceCents: itemPrice,
            fileKey:    item.fileKey ?? null,
          })),
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[checkout] Error:", msg);
    return NextResponse.json(
      { error: "We couldn't complete your checkout. Please try again, or contact support if this continues." },
      { status: 500 }
    );
  }
}
