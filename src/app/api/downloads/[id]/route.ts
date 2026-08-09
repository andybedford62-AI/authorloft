import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";
import { UNLOCK_COOKIE } from "@/lib/downloads";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = req.nextUrl.origin;

  // Light rate-limit so the proxy can't be hammered.
  const rl = await checkRateLimit(getRateLimitKey(req, "ip", "download"), RATE_LIMITS.checkout);
  if (!rl.allowed) return NextResponse.redirect(`${origin}/resources?error=rate`, { status: 302 });

  const item = await prisma.resourceDownload.findUnique({ where: { id } });
  if (!item || !item.isPublished) {
    return NextResponse.redirect(`${origin}/resources?error=notfound`, { status: 302 });
  }

  // Gated items require the unlock cookie (set after an email is submitted).
  if (item.requiresEmail && req.cookies.get(UNLOCK_COOKIE)?.value !== "1") {
    return NextResponse.redirect(`${origin}/resources?gate=${item.id}`, { status: 302 });
  }

  // Count the download (best-effort).
  await prisma.resourceDownload.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
  }).catch(() => {});

  // Redirect to the real file — the raw URL is never rendered in page HTML.
  return NextResponse.redirect(item.fileUrl, { status: 302 });
}
