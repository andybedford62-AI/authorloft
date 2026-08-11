import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

// Public pages cache the live offer's copy for up to 60s (ISR) — bust that
// immediately after any save so terms changes show up on the next load.
function revalidateFoundingOfferPages() {
  revalidatePath("/");
  revalidatePath("/pricing");
}

function validateTerms(body: any) {
  if (body.percentOff !== undefined) {
    const v = Number(body.percentOff);
    if (!Number.isFinite(v) || v < 1 || v > 100) return "Percent off must be between 1 and 100.";
  }
  if (body.durationMonths !== undefined) {
    const v = Number(body.durationMonths);
    if (!Number.isFinite(v) || v < 1) return "Duration must be at least 1 month.";
  }
  if (body.windowDays !== undefined) {
    const v = Number(body.windowDays);
    if (!Number.isFinite(v) || v < 1) return "Window must be at least 1 day.";
  }
  return null;
}

// PATCH /api/super-admin/early-bird/[id] — update terms, and/or enable/disable
// (enabling this offer demotes whichever other offer was previously enabled).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const termsError = validateTerms(body);
  if (termsError) return NextResponse.json({ error: termsError }, { status: 400 });
  if (body.name !== undefined && !body.name.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined)            data.name = body.name.trim();
  if (body.percentOff !== undefined)      data.percentOff = Math.round(Number(body.percentOff));
  if (body.durationMonths !== undefined)  data.durationMonths = Math.round(Number(body.durationMonths));
  if (body.windowDays !== undefined)      data.windowDays = Math.round(Number(body.windowDays));
  if (body.couponIdMonthly !== undefined) data.couponIdMonthly = body.couponIdMonthly?.trim() || null;
  if (body.couponIdAnnual !== undefined)  data.couponIdAnnual = body.couponIdAnnual?.trim() || null;
  if (body.headline !== undefined)        data.headline = body.headline?.trim() || null;
  if (body.subtext !== undefined)         data.subtext = body.subtext?.trim() || null;
  if (body.enabled !== undefined)         data.enabled = !!body.enabled;

  try {
    const offer = await prisma.$transaction(async (tx) => {
      if (data.enabled === true) {
        await tx.earlyBirdOffer.updateMany({ where: { enabled: true, NOT: { id } }, data: { enabled: false } });
      }
      return tx.earlyBirdOffer.update({ where: { id }, data });
    });
    revalidateFoundingOfferPages();
    return NextResponse.json(offer);
  } catch {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }
}

// DELETE /api/super-admin/early-bird/[id] — remove a saved offer preset
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.earlyBirdOffer.delete({ where: { id } });
    revalidateFoundingOfferPages();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }
}
