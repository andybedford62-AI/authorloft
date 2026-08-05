import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

const SELECT = {
  earlyBirdEnabled:         true,
  earlyBirdPercentOff:      true,
  earlyBirdDurationMonths:  true,
  earlyBirdWindowDays:      true,
  earlyBirdCouponIdMonthly: true,
  earlyBirdCouponIdAnnual:  true,
} as const;

// GET /api/super-admin/early-bird — current founding-member offer settings
export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main" },
    update: {},
    select: SELECT,
  });
  return NextResponse.json(config);
}

// PATCH /api/super-admin/early-bird — update the offer (enable/disable, terms, which coupons apply)
export async function PATCH(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const {
    earlyBirdEnabled,
    earlyBirdPercentOff,
    earlyBirdDurationMonths,
    earlyBirdWindowDays,
    earlyBirdCouponIdMonthly,
    earlyBirdCouponIdAnnual,
  } = body;

  if (earlyBirdPercentOff !== undefined) {
    const v = Number(earlyBirdPercentOff);
    if (!Number.isFinite(v) || v < 1 || v > 100) {
      return NextResponse.json({ error: "Percent off must be between 1 and 100." }, { status: 400 });
    }
  }
  if (earlyBirdDurationMonths !== undefined) {
    const v = Number(earlyBirdDurationMonths);
    if (!Number.isFinite(v) || v < 1) {
      return NextResponse.json({ error: "Duration must be at least 1 month." }, { status: 400 });
    }
  }
  if (earlyBirdWindowDays !== undefined) {
    const v = Number(earlyBirdWindowDays);
    if (!Number.isFinite(v) || v < 1) {
      return NextResponse.json({ error: "Window must be at least 1 day." }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {};
  if (earlyBirdEnabled !== undefined)         data.earlyBirdEnabled = !!earlyBirdEnabled;
  if (earlyBirdPercentOff !== undefined)      data.earlyBirdPercentOff = Math.round(Number(earlyBirdPercentOff));
  if (earlyBirdDurationMonths !== undefined)  data.earlyBirdDurationMonths = Math.round(Number(earlyBirdDurationMonths));
  if (earlyBirdWindowDays !== undefined)      data.earlyBirdWindowDays = Math.round(Number(earlyBirdWindowDays));
  if (earlyBirdCouponIdMonthly !== undefined) data.earlyBirdCouponIdMonthly = earlyBirdCouponIdMonthly?.trim() || null;
  if (earlyBirdCouponIdAnnual !== undefined)  data.earlyBirdCouponIdAnnual = earlyBirdCouponIdAnnual?.trim() || null;

  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main", ...data },
    update: data,
    select: SELECT,
  });
  return NextResponse.json(config);
}
