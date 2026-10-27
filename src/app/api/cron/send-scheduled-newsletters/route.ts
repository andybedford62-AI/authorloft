import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { sendNewsletter } from "@/lib/newsletter-send";

// A large list is sent in 50-recipient batches inside one invocation.
export const maxDuration = 300;

/**
 * GET /api/cron/send-scheduled-newsletters
 * Called hourly by Vercel Cron. Sends every Campaign whose status is SCHEDULED
 * and whose scheduledFor has passed.
 *
 * Each campaign is claimed with an atomic SCHEDULED -> SENDING flip first, so an
 * overlapping or retried run can never send the same newsletter twice.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await prisma.campaign.findMany({
    where:   { status: "SCHEDULED", scheduledFor: { lte: new Date() } },
    orderBy: { scheduledFor: "asc" },
    take:    20,
    select: {
      id: true, authorId: true, subject: true, body: true,
      categoryFilter: true, includeBooks: true, includeReview: true, specialId: true,
    },
  });

  let sent = 0;
  let failed = 0;

  for (const c of due) {
    const claim = await prisma.campaign.updateMany({
      where: { id: c.id, status: "SCHEDULED" },
      data:  { status: "SENDING" },
    });
    if (claim.count === 0) continue;

    const gate = await canUseFeature(c.authorId, "newsletter");
    const result = gate.allowed
      ? await sendNewsletter(
          c.authorId,
          {
            subject:        c.subject,
            htmlBody:       c.body ?? "",
            categoryFilter: c.categoryFilter,
            includeBooks:   c.includeBooks,
            includeReview:  c.includeReview,
            specialId:      c.specialId,
          },
          { campaignId: c.id },
        ).catch((e) => {
          console.error(`[cron/send-scheduled-newsletters] ${c.id} threw:`, e);
          return null;
        })
      : null;

    if (result && result.ok) {
      sent++;
    } else {
      failed++;
      // Never leave a row stuck in SENDING; the author sees FAILED in History.
      await prisma.campaign.update({ where: { id: c.id }, data: { status: "FAILED" } });
      console.error(`[cron/send-scheduled-newsletters] ${c.id} failed:`, result && !result.ok ? result.error : gate.allowed ? "exception" : "plan gate");
    }
  }

  return NextResponse.json({ ok: true, due: due.length, sent, failed });
}
