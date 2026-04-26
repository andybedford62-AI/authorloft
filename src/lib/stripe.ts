import Stripe from "stripe";

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

// ── Plan subscription prices ───────────────────────────────────────────────
export const PLAN_PRICES = {
  STANDARD: process.env.STRIPE_STANDARD_PRICE_ID!,
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID!,
};

// ── Create a Stripe Checkout session for a book purchase ──────────────────
export async function createBookCheckoutSession({
  authorStripeAccountId,
  bookId,
  bookTitle,
  priceCents,
  stripePriceId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  authorStripeAccountId?: string;
  bookId: string;
  bookTitle: string;
  priceCents: number;
  stripePriceId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: priceCents,
          product_data: {
            name: bookTitle,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookId,
      type: "book_purchase",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// ── Create a subscription checkout session for author plans ───────────────
export async function createSubscriptionCheckoutSession({
  authorId,
  authorEmail,
  planPriceId,
  successUrl,
  cancelUrl,
}: {
  authorId: string;
  authorEmail: string;
  planPriceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: authorEmail,
    line_items: [
      {
        price: planPriceId,
        quantity: 1,
      },
    ],
    metadata: {
      authorId,
      type: "plan_subscription",
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// ── Generate a secure, time-limited download URL ──────────────────────────
export function generateDownloadExpiry(hoursValid = 48): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hoursValid);
  return expiry;
}
