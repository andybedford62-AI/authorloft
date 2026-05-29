import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

// POST /api/super-admin/authors/[id]/trial — set or clear a time-limited trial upgrade
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { planId, durationMonths } = body as { planId: string | null; durationMonths?: number };

  if (planId === null) {
    // Clear trial — revert to FREE
    const freePlan = await prisma.plan.findFirst({ where: { tier: "FREE" }, select: { id: true } });
    await prisma.author.update({
      where: { id },
      data: {
        trialPlanId:               null,
        trialStartsAt:             null,
        trialEndsAt:               null,
        trialExpiryReminderSentAt: null,
        planId:                    freePlan?.id ?? null,
      },
    });
    return NextResponse.json({ ok: true, action: "cleared" });
  }

  // Validate plan exists and is not FREE
  const plan = await prisma.plan.findUnique({ where: { id: planId }, select: { id: true, tier: true } });
  if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  if (plan.tier === "FREE") return NextResponse.json({ error: "Cannot trial the Free plan" }, { status: 400 });

  const months = Math.max(1, Math.min(12, durationMonths ?? 1));
  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setMonth(endsAt.getMonth() + months);

  await prisma.author.update({
    where: { id },
    data: {
      planId:                    planId,
      trialPlanId:               planId,
      trialStartsAt:             now,
      trialEndsAt:               endsAt,
      trialExpiryReminderSentAt: null,
    },
  });

  return NextResponse.json({ ok: true, action: "set", trialEndsAt: endsAt.toISOString() });
}
