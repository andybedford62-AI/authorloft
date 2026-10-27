import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { sanitize } from "@/lib/sanitize";
import { sendNewsletter, type NewsletterConfig } from "@/lib/newsletter-send";

const MIN_SCHEDULE_AHEAD_MS = 5 * 60 * 1000;
const MAX_SCHEDULE_AHEAD_MS = 365 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const newsletterCheck = await canUseFeature(authorId, "newsletter");
  if (!newsletterCheck.allowed) {
    return NextResponse.json({ error: newsletterCheck.reason }, { status: 403 });
  }

  const body = await req.json();
  const { subject, htmlBody, categoryFilter, includeBooks, includeReview, specialId, scheduledFor, draftId } = body;

  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!htmlBody?.trim() || htmlBody === "<p></p>") {
    return NextResponse.json({ error: "Email body cannot be empty." }, { status: 400 });
  }

  const cfg: NewsletterConfig = {
    subject:        subject.trim(),
    htmlBody,
    categoryFilter: Array.isArray(categoryFilter) ? categoryFilter : [],
    includeBooks:   !!includeBooks,
    includeReview:  !!includeReview,
    specialId:      specialId || null,
  };

  // A draft is consumed once its content is sent or scheduled.
  const consumeDraft = () =>
    draftId
      ? prisma.newsletterDraft.deleteMany({ where: { id: String(draftId), authorId } }).catch(() => {})
      : Promise.resolve();

  // ── Schedule for later ───────────────────────────────────────────────────
  if (scheduledFor) {
    const when = new Date(scheduledFor);
    if (Number.isNaN(when.getTime())) {
      return NextResponse.json({ error: "Invalid schedule time." }, { status: 400 });
    }
    const ahead = when.getTime() - Date.now();
    if (ahead < MIN_SCHEDULE_AHEAD_MS) {
      return NextResponse.json({ error: "Pick a time at least 5 minutes from now." }, { status: 400 });
    }
    if (ahead > MAX_SCHEDULE_AHEAD_MS) {
      return NextResponse.json({ error: "Newsletters can be scheduled up to a year ahead." }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        authorId,
        subject:        cfg.subject,
        status:         "SCHEDULED",
        scheduledFor:   when,
        sentAt:         when,
        totalSent:      0,
        totalFailed:    0,
        totalTargeted:  0,
        body:           sanitize(cfg.htmlBody),
        categoryFilter: cfg.categoryFilter,
        includeBooks:   cfg.includeBooks,
        includeReview:  cfg.includeReview,
        specialId:      cfg.specialId,
      },
      select: { id: true },
    });
    await consumeDraft();
    return NextResponse.json({ scheduled: true, campaignId: campaign.id, scheduledFor: when.toISOString() });
  }

  // ── Send now ─────────────────────────────────────────────────────────────
  const result = await sendNewsletter(authorId, cfg);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  await consumeDraft();
  return NextResponse.json({ sent: result.sent, failed: result.failed, total: result.total });
}
