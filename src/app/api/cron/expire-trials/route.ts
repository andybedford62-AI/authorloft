import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendTrialExpiryWarningEmail, sendTrialEndedEmail } from "@/lib/mailer";
import { isThemeAllowed, BASE_THEME_IDS } from "@/lib/themes";

/**
 * GET /api/cron/expire-trials
 * Called daily by Vercel Cron (see vercel.json).
 *
 * Two passes:
 *  1. 7-day warning — authors whose trial ends in 7–8 days with no reminder sent yet.
 *  2. Expire — authors whose trialEndsAt is in the past; downgrade to FREE.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now     = new Date();
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in8days = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  // ── Pass 1: Send 7-day warning ────────────────────────────────────────────
  const needsWarning = await prisma.author.findMany({
    where: {
      trialEndsAt:               { gte: in7days, lte: in8days },
      trialExpiryReminderSentAt: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      displayName: true,
      trialEndsAt: true,
      trialPlan: { select: { name: true } },
    },
  });

  let warned = 0;
  for (const author of needsWarning) {
    if (!author.trialEndsAt || !author.trialPlan) continue;
    const msLeft      = author.trialEndsAt.getTime() - now.getTime();
    const daysLeft    = Math.round(msLeft / (1000 * 60 * 60 * 24));
    const authorName  = author.displayName || author.name;

    sendTrialExpiryWarningEmail({
      to:             author.email,
      authorName,
      planName:       author.trialPlan.name,
      expiryDate:     author.trialEndsAt,
      daysRemaining:  daysLeft,
    }).catch((e) => console.error(`[cron/expire-trials] Warning email failed for ${author.id}:`, e));

    await prisma.author.update({
      where: { id: author.id },
      data:  { trialExpiryReminderSentAt: now },
    });
    warned++;
  }

  // ── Pass 2: Expire trials ─────────────────────────────────────────────────
  const expired = await prisma.author.findMany({
    where: {
      trialEndsAt: { lt: now },
      trialPlanId: { not: null },
    },
    select: {
      id: true,
      email: true,
      name: true,
      displayName: true,
      siteTheme: true,
      baseTheme: true,
      trialPlan: { select: { name: true } },
    },
  });

  const freePlan = await prisma.plan.findFirst({ where: { tier: "FREE" }, select: { id: true } });

  let expiredCount = 0;
  for (const author of expired) {
    const planName   = author.trialPlan?.name ?? "trial plan";
    const authorName = author.displayName || author.name;

    // Revert theme if the current theme isn't allowed on FREE
    if (author.siteTheme) {
      const allowed = isThemeAllowed(author.siteTheme, "FREE");
      if (!allowed) {
        const revertTo = "modern-minimal";
        await prisma.author.update({
          where: { id: author.id },
          data:  { siteTheme: revertTo },
        }).catch(() => {});
      }
    }

    await prisma.author.update({
      where: { id: author.id },
      data: {
        planId:                    freePlan?.id ?? null,
        trialPlanId:               null,
        trialStartsAt:             null,
        trialEndsAt:               null,
        trialExpiryReminderSentAt: null,
      },
    });

    sendTrialEndedEmail({
      to:        author.email,
      authorName,
      planName,
    }).catch((e) => console.error(`[cron/expire-trials] Ended email failed for ${author.id}:`, e));

    expiredCount++;
  }

  console.log(`[cron/expire-trials] warned=${warned} expired=${expiredCount}`);
  return NextResponse.json({ ok: true, warned, expired: expiredCount });
}
