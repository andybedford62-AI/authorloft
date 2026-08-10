import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";
import { UNLOCK_COOKIE, UNLOCK_COOKIE_MAX_AGE } from "@/lib/downloads";
import { sendResourceDownloadEmail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  // IP rate limit to stop abuse of the lead capture. This alone doesn't stop
  // a rotating-IP attacker from bombing one victim's inbox with "here's your
  // download" emails -- the DownloadLead-based cooldown below is the real
  // per-inbox guard, reusing the lead log we already write on every unlock.
  const rl = await checkRateLimit(getRateLimitKey(req, "ip", "download-unlock"), RATE_LIMITS.subscribe);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });

  const { email, resourceId, source } = await req.json().catch(() => ({}));
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || null;

  const cleanEmail = String(email).trim().toLowerCase();
  const resourceIdStr = resourceId ? String(resourceId) : null;

  const recentLead = resourceIdStr
    ? await prisma.downloadLead.findFirst({
        where: {
          email: cleanEmail,
          resourceId: resourceIdStr,
          createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) },
        },
        select: { id: true },
      }).catch(() => null)
    : null;

  // Store the lead (best-effort — never block the unlock on a write error).
  await prisma.downloadLead.create({
    data: {
      email: cleanEmail,
      resourceId: resourceIdStr,
      source: source ? String(source) : "resource",
      ipAddress: ip,
    },
  }).catch(() => {});

  // Email the lead a copy of the download link (best-effort — never block the
  // unlock). Skipped if we already emailed this address for this resource in
  // the last 5 minutes, regardless of which IP this request came from.
  if (resourceIdStr && !recentLead) {
    const resource = await prisma.resourceDownload
      .findUnique({
        where: { id: resourceIdStr },
        select: { title: true, fileUrl: true, coverImageUrl: true, isPublished: true },
      })
      .catch(() => null);
    if (resource?.isPublished && resource.fileUrl) {
      await sendResourceDownloadEmail({
        to: cleanEmail,
        title: resource.title,
        fileUrl: resource.fileUrl,
        coverImageUrl: resource.coverImageUrl,
      }).catch(() => {});
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(UNLOCK_COOKIE, "1", {
    httpOnly: false, // client reads this to decide whether to show the gate
    path: "/",
    maxAge: UNLOCK_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return res;
}
