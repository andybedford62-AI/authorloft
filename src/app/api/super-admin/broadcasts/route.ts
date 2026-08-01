import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { Resend } from "resend";
import { buildBroadcastMailPayload } from "@/lib/mailer";

const BATCH_SIZE = 50;
const VALID_FILTERS = ["ALL", "FREE", "STANDARD", "PREMIUM"] as const;
type AudienceFilter = (typeof VALID_FILTERS)[number];

export async function GET(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ?count=1&filter=ALL — return recipient count estimate for the compose UI
  if (req.nextUrl.searchParams.get("count") === "1") {
    const filter = (req.nextUrl.searchParams.get("filter") ?? "ALL") as AudienceFilter;
    type PlanTier = "FREE" | "STANDARD" | "PREMIUM";
    const planFilter = filter !== "ALL" ? { plan: { tier: filter as PlanTier } } : {};
    const count = await prisma.author.count({
      where: { platformEmailOptOut: false, emailVerified: { not: null }, isActive: true, ...planFilter },
    });
    return NextResponse.json({ count });
  }

  const broadcasts = await prisma.platformBroadcast.findMany({
    orderBy: { sentAt: "desc" },
    take: 20,
  });
  return NextResponse.json(broadcasts);
}

export async function POST(req: NextRequest) {
  const superAdminId = await requireSuperAdminId();
  if (!superAdminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  const body = await req.json();
  const { subject, broadcastBody, audienceFilter = "ALL", authorId } = body;

  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!broadcastBody?.trim()) return NextResponse.json({ error: "Body is required." }, { status: 400 });

  // Configured AuthorLoft reply-to (Settings → Mass Email). Falls back to the
  // sending admin's own login email if nothing has been configured yet.
  const config = await prisma.systemConfig.findUnique({
    where:  { id: "main" },
    select: { authorReplyToEmail: true },
  });
  let replyTo = config?.authorReplyToEmail || undefined;
  if (!replyTo) {
    const admin = await prisma.author.findUnique({
      where:  { id: superAdminId },
      select: { email: true },
    });
    replyTo = admin?.email;
  }

  // ── Individual send — one author, no unsubscribe footer ──────────────────
  if (authorId) {
    const author = await prisma.author.findUnique({
      where:  { id: authorId },
      select: { id: true, email: true, name: true, displayName: true },
    });
    if (!author) return NextResponse.json({ error: "Author not found." }, { status: 404 });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const payload = buildBroadcastMailPayload({
      to:        author.email,
      firstName: (author.displayName || author.name).split(" ")[0],
      subject:   subject.trim(),
      body:      broadcastBody.trim(),
      replyTo,
    });

    let sent = 0;
    let failed = 0;
    try {
      const result = await resend.emails.send(payload);
      if (result.error) {
        console.error("[broadcast] Individual send error:", result.error);
        failed = 1;
      } else {
        sent = 1;
      }
    } catch (err) {
      console.error("[broadcast] Individual send failed:", err);
      failed = 1;
    }

    if (sent) {
      await prisma.platformBroadcast.create({
        data: {
          subject:           subject.trim(),
          body:              broadcastBody.trim(),
          audienceFilter:    "INDIVIDUAL",
          recipientCount:    1,
          recipientAuthorId: author.id,
          recipientEmail:    author.email,
          sentBy:            superAdminId,
        },
      });
    }

    return NextResponse.json({ ok: sent > 0, sent, failed, total: 1 });
  }

  // ── Mass broadcast — audience segment ────────────────────────────────────
  if (!VALID_FILTERS.includes(audienceFilter)) {
    return NextResponse.json({ error: "Invalid audience filter." }, { status: 400 });
  }

  // Build author query — exclude opted-out and unverified
  type PlanTier = "FREE" | "STANDARD" | "PREMIUM";
  const planFilter = audienceFilter !== "ALL"
    ? { plan: { tier: audienceFilter as PlanTier } }
    : {};

  const authors = await prisma.author.findMany({
    where: {
      platformEmailOptOut: false,
      emailVerified: { not: null },
      isActive: true,
      ...planFilter,
    },
    select: { id: true, email: true, name: true, displayName: true, platformEmailsToken: true },
  });

  if (authors.length === 0) {
    return NextResponse.json({ error: "No eligible recipients for this audience." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < authors.length; i += BATCH_SIZE) {
    const batch = authors.slice(i, i + BATCH_SIZE);
    const emails = batch.map((author) =>
      buildBroadcastMailPayload({
        to:               author.email,
        firstName:        (author.displayName || author.name).split(" ")[0],
        subject:          subject.trim(),
        body:             broadcastBody.trim(),
        unsubscribeToken: author.platformEmailsToken,
        replyTo,
      })
    );

    try {
      const result = await resend.batch.send(emails);
      if (result.error) {
        console.error("[broadcast] Resend batch error:", result.error);
        failed += batch.length;
      } else {
        const emailResults: any[] = (result.data as any)?.data ?? [];
        const successCount = emailResults.filter((r) => r?.id).length;
        sent   += successCount;
        failed += batch.length - successCount;
      }
    } catch (err) {
      console.error("[broadcast] Batch send failed:", err);
      failed += batch.length;
    }

    if (i + BATCH_SIZE < authors.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  await prisma.platformBroadcast.create({
    data: {
      subject:        subject.trim(),
      body:           broadcastBody.trim(),
      audienceFilter,
      recipientCount: sent,
      sentBy:         superAdminId,
    },
  });

  return NextResponse.json({ ok: true, sent, failed, total: authors.length });
}

