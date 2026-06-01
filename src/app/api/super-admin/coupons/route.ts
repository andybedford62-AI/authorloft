import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { stripe } from "@/lib/stripe";

// GET /api/super-admin/coupons — list all Stripe coupons
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

    if (!name || !discountType || !discountValue || !duration) {
      return NextResponse.json({ error: "name, discountType, discountValue, and duration are required." }, { status: 400 });
    }

    const couponData: Record<string, any> = {
      name,
      duration,
      ...(duration === "repeating" && durationMonths && { duration_in_months: parseInt(durationMonths) }),
      ...(maxRedemptions && { max_redemptions: parseInt(maxRedemptions) }),
    };

    if (discountType === "percent") {
      couponData.percent_off = parseFloat(discountValue);
    } else {
      couponData.amount_off = Math.round(parseFloat(discountValue) * 100);
      couponData.currency   = currency || "usd";
    }

    const coupon = await stripe.coupons.create(couponData);
    return NextResponse.json(coupon, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to create coupon." }, { status: 500 });
  }
}
