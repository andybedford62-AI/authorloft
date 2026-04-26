import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/cron/cleanup-unverified
 * Called by Vercel Cron nightly (see vercel.json).
 * Hard-deletes Author rows that were never email-verified and whose
 * 48-hour verification window has expired.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.author.deleteMany({
    where: {
      emailVerified: null,
      emailVerifyExpiry: { lt: new Date() },
    },
  });

  console.log(`[cron/cleanup-unverified] Deleted ${result.count} abandoned unverified accounts`);
  return NextResponse.json({ ok: true, deleted: result.count });
}
