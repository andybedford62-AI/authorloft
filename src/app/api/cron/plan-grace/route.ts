import { NextRequest, NextResponse } from "next/server";
import { reconcileAllAuthors } from "@/lib/plan-downgrade";

/**
 * GET /api/cron/plan-grace
 * Called daily by Vercel Cron (see vercel.json).
 *
 * Reconciles every author's published content against their plan: starts the
 * 30-day grace period when a downgrade leaves them over limits, sends the
 * reminders, unpublishes the excess once the grace period ends, and restores
 * hidden items after an upgrade. Add ?dryRun=1 to see what it WOULD do without
 * writing anything or sending email.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const { results, failures, total } = await reconcileAllAuthors({ dryRun });

  const acted = results.filter((r) => r.action !== "none" || r.hidden > 0 || r.restored > 0);
  console.log(
    `[cron/plan-grace] dryRun=${dryRun} authors=${total} acted=${acted.length} failures=${failures.length}`,
  );
  return NextResponse.json({ ok: true, dryRun, total, acted, failures });
}
