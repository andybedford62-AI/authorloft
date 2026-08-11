import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

function validateTerms(body: any) {
  const percentOff = Number(body.percentOff);
  if (!Number.isFinite(percentOff) || percentOff < 1 || percentOff > 100) {
    return "Percent off must be between 1 and 100.";
  }
  const durationMonths = Number(body.durationMonths);
  if (!Number.isFinite(durationMonths) || durationMonths < 1) {
    return "Duration must be at least 1 month.";
  }
  const windowDays = Number(body.windowDays);
  if (!Number.isFinite(windowDays) || windowDays < 1) {
    return "Window must be at least 1 day.";
  }
  return null;
}

// GET /api/super-admin/early-bird — list all saved founding-member offer presets
export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const offers = await prisma.earlyBirdOffer.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(offers);
}

// POST /api/super-admin/early-bird — save a new offer preset
export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  const termsError = validateTerms(body);
  if (termsError) return NextResponse.json({ error: termsError }, { status: 400 });

  const data = {
    name:              body.name.trim(),
    percentOff:        Math.round(Number(body.percentOff)),
    durationMonths:    Math.round(Number(body.durationMonths)),
    windowDays:        Math.round(Number(body.windowDays)),
    couponIdMonthly:   body.couponIdMonthly?.trim() || null,
    couponIdAnnual:    body.couponIdAnnual?.trim() || null,
    headline:          body.headline?.trim() || null,
    subtext:           body.subtext?.trim() || null,
  };

  // Only one offer may be enabled at a time — creating a new enabled offer
  // demotes any currently-enabled one.
  const enabled = !!body.enabled;
  const offer = await prisma.$transaction(async (tx) => {
    if (enabled) await tx.earlyBirdOffer.updateMany({ where: { enabled: true }, data: { enabled: false } });
    return tx.earlyBirdOffer.create({ data: { ...data, enabled } });
  });

  if (enabled) {
    revalidatePath("/");
    revalidatePath("/pricing");
  }
  return NextResponse.json(offer, { status: 201 });
}
