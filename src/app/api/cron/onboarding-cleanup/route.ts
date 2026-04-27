import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOnboardingReminderEmail } from "@/lib/mailer";

/**
 * GET /api/cron/onboarding-cleanup
 * Called by Vercel Cron nightly (see vercel.json).
 *
 * Two passes:
 *  1. Day-7 reminder — authors who verified email 7–8 days ago, never added a book,
 *     and haven't had a reminder sent yet.
 *  2. Day-14 delete — authors who verified email >14 days ago and still have no books.
 *     Their email + slug are freed for re-signup.
 *
 * Super-admin accounts are always excluded.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now     = new Date();
  const day7    = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const day8    = new Date(now.getTime() - 8  * 24 * 60 * 60 * 1000);
  const day14   = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // ── Pass 1: Send day-7 reminder ──────────────────────────────────────────────
  const needsReminder = await prisma.author.findMany({
    where: {
      isSuperAdmin:             false,
      onboardingCompletedAt:    null,
      onboardingReminderSentAt: null,
      emailVerified:            { gte: day8, lte: day7 },
      books:                    { none: {} },
    },
    select: { id: true, email: true, name: true, displayName: true, slug: true },
  });

  let reminded = 0;
  for (const author of needsReminder) {
    const name = author.displayName || author.name;
    sendOnboardingReminderEmail(author.email, name, author.slug)
      .catch((e) => console.error(`[cron/onboarding-cleanup] Reminder email failed for ${author.id}:`, e));

    await prisma.author.update({
      where: { id: author.id },
      data:  { onboardingReminderSentAt: now },
    });
    reminded++;
  }

  // ── Pass 2: Delete day-14 ghosts ─────────────────────────────────────────────
  const deleted = await prisma.author.deleteMany({
    where: {
      isSuperAdmin:          false,
      onboardingCompletedAt: null,
      emailVerified:         { not: null, lt: day14 },
      books:                 { none: {} },
    },
  });

  console.log(
    `[cron/onboarding-cleanup] reminded=${reminded} deleted=${deleted.count}`
  );

  return NextResponse.json({ ok: true, reminded, deleted: deleted.count });
}
