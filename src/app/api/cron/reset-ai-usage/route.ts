import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/cron/reset-ai-usage
 * Called by Vercel Cron on the 1st of each month (see vercel.json).
 * Resets aiUsageCount to 0 for all authors whose reset window has elapsed.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await prisma.author.updateMany({
    where: {
      OR: [
        { aiUsageResetAt: null },
        { aiUsageResetAt: { lte: thirtyDaysAgo } },
      ],
    },
    data: {
      aiUsageCount:  0,
      aiUsageResetAt: new Date(),
    },
  });

  console.log(`[cron/reset-ai-usage] Reset ${result.count} authors`);
  return NextResponse.json({ ok: true, reset: result.count });
}
