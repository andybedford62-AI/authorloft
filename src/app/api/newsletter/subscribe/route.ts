import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { syncSubscriberToProvider, type EmailProvider } from "@/lib/email-integrations";
import { sendAuthorNewsletterConfirmationEmail, buildAuthorNewsletterConfirmLink } from "@/lib/mailer";

// ── Rate limiting (in-memory, best-effort for serverless) ─────────────────────
const attempts = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 10;

function checkRateLimit(key: string): boolean {
  const now  = Date.now();
  const hits = (attempts.get(key) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return false;
  hits.push(now);
  attempts.set(key, hits);
  return true;
}

const RESEND_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const schema = z.object({
  authorId: z.string(),
  name: z.string().max(200).optional(),
  email: z.string().email().max(200),
  categoryPrefs: z.array(z.string().max(100)).max(50).optional(),
});

// Double opt-in: direct signups (this modal) are unverified until the reader
// clicks the confirmation email. Purchase-triggered and reader-magnet
// Subscriber captures are NOT routed through here -- those already carry an
// implicit verification (a paid transaction, or a click-to-download link),
// so they stay auto-confirmed. Every author's sends share the same
// noreply@authorloft.com address, so an unconfirmed/dirty list from one
// author's direct-signup form risks deliverability for everyone on the
// platform, not just that author.
//
// Unconfirmed resubmissions are throttled by lastConfirmationSentAt (5 min
// cooldown) so an inbox can't be spammed with repeat confirmation emails --
// the per-IP rate limiter below doesn't stop a targeted resubmission of
// someone else's email address on its own.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`${ip}:${data.email}`)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const author = await prisma.author.findUnique({
      where: { id: data.authorId },
      select: {
        displayName: true, name: true,
        emailProvider: true, emailProviderKey: true, emailProviderExtra: true,
      },
    });
    if (!author) return NextResponse.json({ error: "Author not found." }, { status: 404 });

    const existing = await prisma.subscriber.findUnique({
      where: { authorId_email: { authorId: data.authorId, email: data.email } },
      select: { id: true, isConfirmed: true, lastConfirmationSentAt: true },
    });

    if (existing?.isConfirmed) {
      await prisma.subscriber.update({
        where: { id: existing.id },
        data: { name: data.name, categoryPrefs: data.categoryPrefs || [] },
      });
      return NextResponse.json({ success: true, id: existing.id, alreadyConfirmed: true });
    }

    if (existing?.lastConfirmationSentAt && Date.now() - existing.lastConfirmationSentAt.getTime() < RESEND_COOLDOWN_MS) {
      await prisma.subscriber.update({
        where: { id: existing.id },
        data: { name: data.name, categoryPrefs: data.categoryPrefs || [] },
      });
      return NextResponse.json({ success: true, id: existing.id });
    }

    const confirmToken = randomBytes(32).toString("hex");
    const now = new Date();

    const subscriber = await prisma.subscriber.upsert({
      where: { authorId_email: { authorId: data.authorId, email: data.email } },
      update: { name: data.name, categoryPrefs: data.categoryPrefs || [], confirmToken, lastConfirmationSentAt: now },
      create: {
        authorId: data.authorId,
        name: data.name,
        email: data.email,
        categoryPrefs: data.categoryPrefs || [],
        confirmToken,
        lastConfirmationSentAt: now,
      },
    });

    const authorName = author.displayName || author.name;
    sendAuthorNewsletterConfirmationEmail({
      to: data.email,
      name: data.name,
      authorName,
      confirmUrl: buildAuthorNewsletterConfirmLink(confirmToken),
    }).catch((e) => console.error("[newsletter/subscribe] Failed to send confirmation email:", e));

    // Fire-and-forget sync to external email provider if configured. Synced
    // immediately rather than waiting for confirmation -- the provider is the
    // author's own separate list/tool, not the shared AuthorLoft sending
    // pipeline this double opt-in is protecting.
    if (author.emailProvider && author.emailProviderKey) {
      syncSubscriberToProvider(
        author.emailProvider as EmailProvider,
        author.emailProviderKey,
        author.emailProviderExtra ?? null,
        data.email,
        data.name
      ).catch((err) => {
        console.error("[newsletter/subscribe] External sync failed:", err);
      });
    }

    return NextResponse.json({ success: true, id: subscriber.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
