import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseFeature } from "@/lib/plan-limits";
import { resolveAccentColor } from "@/lib/themes";
import { Resend } from "resend";

type Params = { params: Promise<{ id: string }> };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const BATCH_SIZE = 50;

export async function POST(req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const newsletterCheck = await canUseFeature(authorId, "newsletter");
  if (!newsletterCheck.allowed) {
    return NextResponse.json({ error: newsletterCheck.reason }, { status: 403 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  const course = await prisma.course.findFirst({
    where: { id, authorId, kind: "COURSE" },
    select: {
      id: true, title: true, slug: true, description: true, coverImageUrl: true,
      priceCents: true, isPublished: true, courseAnnouncedAt: true,
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!course.isPublished) {
    return NextResponse.json({ error: "Publish the course before announcing it." }, { status: 400 });
  }
  if (course.courseAnnouncedAt) {
    return NextResponse.json({ error: "This course has already been announced." }, { status: 400 });
  }

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      name: true, displayName: true, slug: true, contactEmail: true,
      logoUrl: true, profileImageUrl: true,
      siteTheme: true, customAccentColor: true,
      plan: { select: { tier: true } },
    },
  });
  if (!author) return NextResponse.json({ error: "Author not found." }, { status: 404 });

  const subscribers = await prisma.subscriber.findMany({
    where: {
      authorId,
      isConfirmed: true,
      OR: [
        { categoryPrefs: { isEmpty: true } },
        { categoryPrefs: { hasSome: ["courses"] } },
      ],
    },
    select: { email: true, unsubscribeToken: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No subscribers have opted in to course announcements yet." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const authorName = author.displayName || author.name;
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const siteUrl = `https://${author.slug}.${platformDomain}`;
  const courseUrl = `${siteUrl}/courses/${course.slug}`;
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://www.authorloft.com";
  const fromAddress = `${authorName} via AuthorLoft <noreply@authorloft.com>`;
  const replyTo = author.contactEmail ?? undefined;
  const accentColor = resolveAccentColor({
    planTier: author.plan?.tier,
    customAccentColor: author.customAccentColor,
    siteTheme: author.siteTheme,
  });
  const priceLabel = course.priceCents === 0 ? "Free" : `$${(course.priceCents / 100).toFixed(2)}`;
  const subject = `New course: ${course.title}`;

  const brandMark = author.logoUrl
    ? `<img src="${escapeHtml(author.logoUrl)}" alt="${escapeHtml(authorName)}" height="56" style="display:block;max-height:56px;width:auto;border:0;margin:0 auto;" />`
    : author.profileImageUrl
      ? `<img src="${escapeHtml(author.profileImageUrl)}" alt="${escapeHtml(authorName)}" width="60" height="60" style="display:block;width:60px;height:60px;border-radius:50%;border:0;object-fit:cover;margin:0 auto;" />`
      : `<table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td width="60" height="60" align="center" valign="middle" style="width:60px;height:60px;border-radius:50%;background:#ffffff;color:${accentColor};font-size:22px;font-weight:700;">${escapeHtml(initialsOf(authorName))}</td></tr></table>`;

  const courseInfo = course;

  function buildHtml(unsubscribeUrl: string) {
    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:${accentColor};padding:36px 40px 30px;text-align:center;">
            ${brandMark}
            <p style="margin:16px 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65);">New course</p>
            <p style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">${escapeHtml(authorName)}</p>
          </td>
        </tr>
        <tr><td style="padding:30px 40px 8px;">
          ${courseInfo.coverImageUrl ? `<img src="${escapeHtml(courseInfo.coverImageUrl)}" alt="${escapeHtml(courseInfo.title)}" style="display:block;width:100%;max-width:200px;border-radius:8px;margin:0 auto 20px;" />` : ""}
          <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;text-align:center;">${escapeHtml(courseInfo.title)}</p>
          <p style="margin:0 0 20px;font-size:13px;color:#6b7280;text-align:center;font-weight:600;">${escapeHtml(priceLabel)}</p>
          ${courseInfo.description ? `<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">${escapeHtml(courseInfo.description)}</p>` : ""}
        </td></tr>
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <table cellpadding="0" cellspacing="0" align="center"><tr><td style="border-radius:999px;background:${accentColor};">
            <a href="${escapeHtml(courseUrl)}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">View the course &rarr;</a>
          </td></tr></table>
        </td></tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              You're receiving this because you asked to hear about new courses from
              <span style="color:#6b7280;font-weight:600;">${escapeHtml(authorName)}</span> on AuthorLoft.
            </p>
            <p style="margin:8px 0 0;font-size:12px;">
              <a href="${escapeHtml(unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(siteUrl)}" style="color:#6b7280;text-decoration:underline;">Visit site</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  const campaign = await prisma.campaign.create({
    data: {
      authorId,
      subject,
      totalSent: 0,
      totalFailed: 0,
      totalTargeted: subscribers.length,
      body: course.description ? `<p>${escapeHtml(course.description)}</p>` : null,
      categoryFilter: ["courses"],
    },
  });

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const emails = batch.map((sub) => {
      const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}`;
      return {
        from: fromAddress,
        to: sub.email,
        subject,
        replyTo,
        html: buildHtml(unsubscribeUrl),
        text: `${course.title}\n${priceLabel}\n\n${course.description ?? ""}\n\nView the course: ${courseUrl}\n\n---\nUnsubscribe: ${unsubscribeUrl}`,
      };
    });

    try {
      const result = await resend.batch.send(emails);
      if (result.error) {
        console.error("[course-announce] Resend batch error:", result.error);
        failed += batch.length;
      } else {
        const emailResults: any[] = (result.data as any)?.data ?? [];
        const successCount = emailResults.filter((r) => r?.id).length;
        sent += successCount;
        failed += batch.length - successCount;

        const logRows = batch
          .map((sub, idx) => ({ sub, resendId: emailResults[idx]?.id as string | undefined }))
          .filter((r): r is { sub: typeof batch[number]; resendId: string } => !!r.resendId)
          .map((r) => ({
            campaignId: campaign.id,
            subscriberEmail: r.sub.email,
            resendEmailId: r.resendId,
          }));
        if (logRows.length > 0) {
          await prisma.campaignSendLog.createMany({ data: logRows, skipDuplicates: true })
            .catch((e) => console.error("[course-announce] Failed to write CampaignSendLog rows:", e));
        }
      }
    } catch (err) {
      console.error("[course-announce] Batch send failed:", err);
      failed += batch.length;
    }

    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  await prisma.campaign.update({
    where: { id: campaign.id },
    data: { totalSent: sent, totalFailed: failed },
  });

  // Stamped regardless of partial send failures -- this is a one-time,
  // deliberately-clicked action, and retrying would resend to people who
  // already got it.
  await prisma.course.update({
    where: { id: course.id },
    data: { courseAnnouncedAt: new Date() },
  });

  return NextResponse.json({ sent, failed, total: subscribers.length });
}
