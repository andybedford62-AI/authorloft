import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { stripe } from "@/lib/stripe";

const VALID_DURATIONS  = ["once", "repeating", "forever"] as const;
const VALID_CURRENCIES = ["usd", "eur", "gbp", "cad", "aud"] as const;

// GET /api/super-admin/coupons — list all Stripe coupons (max 100; add pagination if needed beyond that)
export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const coupons = await stripe.coupons.list({ limit: 100 });
    return NextResponse.json(coupons.data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load coupons." }, { status: 500 });
  }
}

// POST /api/super-admin/coupons — create a new Stripe coupon
export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, discountType, discountValue, duration, durationMonths, maxRedemptions, currency } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "name is required." }, { status: 400 });
    }
    if (discountType !== "percent" && discountType !== "amount") {
      return NextResponse.json({ error: "discountType must be 'percent' or 'amount'." }, { status: 400 });
    }
    if (!VALID_DURATIONS.includes(duration)) {
      return NextResponse.json({ error: "duration must be once, repeating, or forever." }, { status: 400 });
    }

    const value = parseFloat(discountValue);
    if (!isFinite(value) || value <= 0) {
      return NextResponse.json({ error: "discountValue must be a positive number." }, { status: 400 });
    }
    if (discountType === "percent" && value > 100) {
      return NextResponse.json({ error: "Percent discount cannot exceed 100." }, { status: 400 });
    }

    const currencyCode = (currency || "usd").toLowerCase();
    if (!VALID_CURRENCIES.includes(currencyCode as any)) {
      return NextResponse.json({ error: `currency must be one of: ${VALID_CURRENCIES.join(", ")}.` }, { status: 400 });
    }

    const couponData: Record<string, any> = {
      name: name.trim(),
      duration,
      ...(duration === "repeating" && durationMonths && { duration_in_months: parseInt(durationMonths) }),
      ...(maxRedemptions && { max_redemptions: parseInt(maxRedemptions) }),
    };

    if (discountType === "percent") {
      couponData.percent_off = value;
    } else {
      couponData.amount_off = Math.round(value * 100);
      couponData.currency   = currencyCode;
    }

    const coupon = await stripe.coupons.create(couponData);
    return NextResponse.json(coupon, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to create coupon." }, { status: 500 });
  }
}
