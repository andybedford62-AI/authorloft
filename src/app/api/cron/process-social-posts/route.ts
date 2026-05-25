import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/db";
import { publishSocialPost }         from "@/lib/social/publisher";

/**
 * GET /api/cron/process-social-posts
 * Called by Vercel Cron every 5 minutes (see vercel.json).
 * Finds all SCHEDULED posts whose scheduledAt has passed and publishes them.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const duePosts = await prisma.socialPost.findMany({
    where: {
      status:      "SCHEDULED",
      scheduledAt: { lte: now },
    },
    select: { id: true, caption: true, platforms: true },
  });

  console.log(`[cron/process-social-posts] Found ${duePosts.length} post(s) to publish`);

  const results = await Promise.allSettled(
    duePosts.map((post) => publishSocialPost(post.id))
  );

  const published = results.filter((r) => r.status === "fulfilled").length;
  const failed    = results.filter((r) => r.status === "rejected").length;

  if (failed > 0) {
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`[cron/process-social-posts] Failed post ${duePosts[i].id}:`, r.reason);
      }
    });
  }

  console.log(`[cron/process-social-posts] Done — published: ${published}, failed: ${failed}`);
  return NextResponse.json({ ok: true, processed: duePosts.length, published, failed });
}
