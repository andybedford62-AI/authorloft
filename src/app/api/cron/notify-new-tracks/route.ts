import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { sendTrackNotice, MIN_NOTICE_GAP_MS } from "@/lib/music-notify";

export const maxDuration = 300;

/**
 * GET /api/cron/notify-new-tracks
 * Called daily by Vercel Cron (15:00 UTC). For every published, announced music
 * list whose author turned on "auto-notify", emails subscribers once about the
 * tracks added since the last notice. sendTrackNotice enforces the rules:
 * at least 24h since the previous notice, nothing sent while the list was
 * edited in the last 2 hours (it is picked up the next day), and nothing when
 * no tracks are new.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lists = await prisma.course.findMany({
    where: {
      kind: "MUSIC",
      isPublished: true,
      autoNotifyTracks: true,
      courseAnnouncedAt: { not: null },
      trackBaselineAt: { not: null },
      OR: [{ trackNoticeAt: null }, { trackNoticeAt: { lt: new Date(Date.now() - MIN_NOTICE_GAP_MS) } }],
    },
    select: { id: true, authorId: true },
    take: 100,
  });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const l of lists) {
    const gate = await canUseFeature(l.authorId, "newsletter");
    if (!gate.allowed) { skipped++; continue; }

    const result = await sendTrackNotice(l.authorId, l.id, { quiet: true }).catch((e) => {
      console.error(`[cron/notify-new-tracks] ${l.id} threw:`, e);
      return null;
    });
    if (result === null) failed++;
    else if (result.ok) sent++;
    else skipped++; // nothing new, edited recently, or no subscribers: all fine to skip
  }

  return NextResponse.json({ ok: true, lists: lists.length, sent, skipped, failed });
}
