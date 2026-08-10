import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { sendNewsSubscriptionConfirmationEmail, buildNewsConfirmLink } from "@/lib/mailer";

// ── Rate limiting (in-memory, best-effort for serverless) ─────────────────────
const attempts = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 10;

function checkRateLimit(key: string): boolean {
  const now  = Date.now();
  const hits = (attempts.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return false;
  hits.push(now);
  attempts.set(key, hits);
  return true;
}

const RESEND_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.enum(["news", "footer", "home"]).optional(),
});

// POST /api/news/subscribe — public AuthorLoft News signup.
// Double opt-in: captures the row immediately (idempotent by email) but only
// counts as confirmed once the subscriber clicks the link in the email this
// sends. Already-confirmed subscribers who submit again are just upserted
// silently — no repeat confirmation email. Unconfirmed resubmissions are
// throttled by lastConfirmationSentAt (5 min cooldown) so an inbox can't be
// spammed with repeat confirmation emails, whether that's the same person
// retrying or someone else entering that email address maliciously — the
// per-IP rate limiter below doesn't stop either of those on its own.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`${ip}:${data.email}`)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const email = data.email.trim().toLowerCase();

    const existing = await prisma.platformSubscriber.findUnique({
      where: { email },
      select: { id: true, isConfirmed: true, lastConfirmationSentAt: true },
    });

    if (existing?.isConfirmed) {
      await prisma.platformSubscriber.update({
        where: { id: existing.id },
        data: { name: data.name, source: data.source ?? undefined },
      });
      return NextResponse.json({ success: true, id: existing.id, alreadyConfirmed: true });
    }

    // Unconfirmed and a confirmation email went out recently — update the
    // row (name/source may have changed) but don't send another one.
    if (existing?.lastConfirmationSentAt && Date.now() - existing.lastConfirmationSentAt.getTime() < RESEND_COOLDOWN_MS) {
      await prisma.platformSubscriber.update({
        where: { id: existing.id },
        data: { name: data.name, source: data.source ?? undefined },
      });
      return NextResponse.json({ success: true, id: existing.id });
    }

    // New signup, or an existing-but-unconfirmed row past the cooldown —
    // issue a fresh token either way so an old, possibly-shared link can't
    // be reused.
    const confirmToken = randomBytes(32).toString("hex");
    const now = new Date();

    const subscriber = await prisma.platformSubscriber.upsert({
      where: { email },
      update: { name: data.name, source: data.source ?? undefined, confirmToken, lastConfirmationSentAt: now },
      create: { email, name: data.name, source: data.source ?? "news", confirmToken, lastConfirmationSentAt: now },
      select: { id: true },
    });

    sendNewsSubscriptionConfirmationEmail({
      to: email,
      name: data.name,
      confirmUrl: buildNewsConfirmLink(confirmToken),
    }).catch((e) => console.error("[news/subscribe] Failed to send confirmation email:", e));

    return NextResponse.json({ success: true, id: subscriber.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    console.error("[news/subscribe] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
