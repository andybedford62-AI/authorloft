import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, createHmac } from "crypto";
import { prisma } from "@/lib/db";

// POST /api/webhooks/resend — Resend's email.opened / email.clicked events,
// used to populate CampaignSendLog for newsletter open/click analytics.
//
// Requires manual setup in the Resend dashboard (no code-only path exists):
//   1. Domains -> the sending domain -> enable Open Tracking + Click Tracking.
//   2. Webhooks -> Add Endpoint -> this route's URL, subscribed to at least
//      email.opened and email.clicked.
//   3. Copy the signing secret (starts "whsec_") into RESEND_WEBHOOK_SECRET.
// Without RESEND_WEBHOOK_SECRET set, this route 500s harmlessly -- sending
// still works, opens/clicks just won't be recorded.
//
// Resend webhooks are Svix-signed; Resend's own SDK has no verification
// helper (confirmed against the installed resend package's exports), so
// this implements Svix's manual verification algorithm directly rather
// than adding the svix package as a new dependency for one endpoint.
function verifySvixSignature(opts: {
  id: string;
  timestamp: string;
  body: string;
  signatureHeader: string;
  secret: string;
}): boolean {
  const { id, timestamp, body, signatureHeader, secret } = opts;

  // Reject stale/future timestamps (5 min tolerance) to limit replay risk.
  const tsSeconds = Number(timestamp);
  if (!Number.isFinite(tsSeconds)) return false;
  const skewSeconds = Math.abs(Date.now() / 1000 - tsSeconds);
  if (skewSeconds > 300) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${id}.${timestamp}.${body}`;
  const expected = createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const expectedBuf = Buffer.from(expected);

  // svix-signature is space-delimited "v1,<base64sig>" entries -- any match passes.
  for (const part of signatureHeader.split(" ")) {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) continue;
    const sigBuf = Buffer.from(sig);
    if (sigBuf.length !== expectedBuf.length) continue;
    if (timingSafeEqual(sigBuf, expectedBuf)) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhooks/resend] RESEND_WEBHOOK_SECRET is not set — cannot verify webhook.");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const svixId        = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  const rawBody        = await req.text();

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
  }

  const valid = verifySvixSignature({
    id: svixId, timestamp: svixTimestamp, body: rawBody, signatureHeader: svixSignature, secret,
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailId = event?.data?.email_id as string | undefined;
  if (!emailId) return NextResponse.json({ received: true });

  try {
    if (event.type === "email.opened") {
      await prisma.campaignSendLog.updateMany({
        where: { resendEmailId: emailId, openedAt: null },
        data:  { openedAt: new Date() },
      });
    } else if (event.type === "email.clicked") {
      const log = await prisma.campaignSendLog.findUnique({
        where: { resendEmailId: emailId },
        select: { id: true, firstClickedAt: true },
      });
      if (log) {
        await prisma.campaignSendLog.update({
          where: { id: log.id },
          data: {
            clickCount: { increment: 1 },
            firstClickedAt: log.firstClickedAt ?? new Date(),
          },
        });
      }
    }
  } catch (err) {
    // Resend retries on non-2xx, so log and still ack -- a missing/duplicate
    // CampaignSendLog row isn't worth a retry storm.
    console.error("[webhooks/resend] Failed to record event:", err);
  }

  return NextResponse.json({ received: true });
}
