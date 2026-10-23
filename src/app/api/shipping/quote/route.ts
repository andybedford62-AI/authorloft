import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";
import { quoteShipping, shippableCountries, bundleShares } from "@/lib/shipping";
import { shippingFailureMessage, toShippingCartItem, withShippingProfile } from "@/lib/shipping-server";
import { countryName, isShippableCountry } from "@/lib/shipping-countries";

/**
 * POST /api/shipping/quote
 * Body: { saleItemIds: string[], country?: "US" }
 * Returns { hasPrint, countries, quote? } for the cart: which countries every print item in the cart
 * can ship to, and (when a country is given) the postage for it. Digital items are ignored.
 * Checkout recomputes shipping server-side, so this is a preview, never a source of truth.
 */
export async function POST(req: NextRequest) {
  const limit = await checkRateLimit(getRateLimitKey(req, "ip", "shipping-quote"), RATE_LIMITS.checkout);
  if (!limit.allowed) return NextResponse.json({ error: "Too many requests. Please try again in a moment." }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  let ids: unknown = body.saleItemIds;
  // For a bundle, what counts toward a free-shipping threshold is each edition's share of the bundle price.
  let shares: Map<string, number> | null = null;
  if (typeof body.bundleId === "string" && body.bundleId) {
    const bundle = await prisma.bundle.findFirst({
      where: { id: body.bundleId, isPublished: true },
      select: { priceCents: true, items: { select: { saleItemId: true, saleItem: { select: { priceCents: true } } } } },
    });
    ids = bundle?.items.map((i) => i.saleItemId) ?? [];
    if (bundle) shares = bundleShares(bundle.items.map((i) => ({ id: i.saleItemId, priceCents: i.saleItem.priceCents })), bundle.priceCents);
  }
  if (!Array.isArray(ids) || ids.length > 50 || ids.some((i) => typeof i !== "string")) {
    return NextResponse.json({ error: "saleItemIds or bundleId is required." }, { status: 400 });
  }
  if (ids.length === 0) return NextResponse.json({ hasPrint: false, countries: [] });
  const country = typeof body.country === "string" ? body.country.toUpperCase() : null;
  if (country && !isShippableCountry(country)) {
    return NextResponse.json({ error: "That country isn't supported." }, { status: 400 });
  }

  const items = await prisma.bookDirectSaleItem.findMany({
    where: { id: { in: ids as string[] }, isActive: true, format: "PRINT" },
    include: withShippingProfile,
  });
  if (items.length === 0) return NextResponse.json({ hasPrint: false, countries: [] });

  const cartItems = items.map(toShippingCartItem).map((c) => (shares?.has(c.saleItemId) ? { ...c, priceCents: shares.get(c.saleItemId)! } : c));
  const countries = shippableCountries(cartItems);

  if (!country) return NextResponse.json({ hasPrint: true, countries });

  const quote = quoteShipping(cartItems, country);
  if (!quote.ok) {
    return NextResponse.json({
      hasPrint: true,
      countries,
      quote: { ok: false, reason: quote.reason, message: shippingFailureMessage(quote.reason, countryName(country)) },
    });
  }
  return NextResponse.json({
    hasPrint: true,
    countries,
    quote: { ok: true, amountCents: quote.amountCents, freeApplied: quote.freeApplied, estimateNotes: quote.estimateNotes },
  });
}
