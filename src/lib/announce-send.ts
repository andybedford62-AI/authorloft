// One-time "new thing" announcement emails (a course, a music list, a blog post)
// to the author's confirmed subscribers who either want everything (empty
// categoryPrefs) or opted in to this interest tag. Shared by the course, music
// and blog announce routes so the send loop, branding and analytics logging
// live in one place.
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { resolveAccentColor } from "@/lib/themes";
import { escapeHtml, initialsOf } from "@/lib/newsletter-email";

const BATCH_SIZE = 50;

export type InterestTag = "courses" | "music" | "blog";

export interface AnnouncementInput {
  authorId:    string;
  tag:         InterestTag;
  subject:     string;
  eyebrow:     string;            // small masthead label, e.g. "New course"
  title:       string;
  subtitle?:   string | null;     // e.g. price or "Album · 8 tracks"
  description?: string | null;
  items?:      string[];          // optional bullet list (e.g. new track titles)
  imageUrl?:   string | null;
  ctaLabel:    string;            // e.g. "View the course"
  ctaPath:     string;            // path on the author's site, e.g. "/courses/my-course"
  reason:      string;            // completes "You're receiving this because ..."
  noSubscribersError: string;
  logTag:      string;
}

export type AnnouncementOutcome =
  | { ok: true; sent: number; failed: number; total: number }
  | { ok: false; error: string; status: number };

export async function sendAnnouncement(input: AnnouncementInput): Promise<AnnouncementOutcome> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "Email service is not configured.", status: 503 };
  }
  const { authorId, tag, subject, title } = input;

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      name: true, displayName: true, slug: true, contactEmail: true,
      logoUrl: true, profileImageUrl: true,
      siteTheme: true, customAccentColor: true,
      plan: { select: { tier: true } },
    },
  });
  if (!author) return { ok: false, error: "Author not found.", status: 404 };

  const subscribers = await prisma.subscriber.findMany({
    where: {
      authorId,
      isConfirmed: true,
      OR: [
        { categoryPrefs: { isEmpty: true } },
        { categoryPrefs: { hasSome: [tag] } },
      ],
    },
    select: { email: true, unsubscribeToken: true },
  });
  if (subscribers.length === 0) {
    return { ok: false, error: input.noSubscribersError, status: 400 };
  }

  const resend         = new Resend(process.env.RESEND_API_KEY);
  const authorName     = author.displayName || author.name;
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const siteUrl        = `https://${author.slug}.${platformDomain}`;
  const targetUrl      = `${siteUrl}${input.ctaPath}`;
  const baseUrl        = process.env.NEXTAUTH_URL ?? "https://www.authorloft.com";
  const fromAddress    = `${authorName} via AuthorLoft <noreply@authorloft.com>`;
  const replyTo        = author.contactEmail ?? undefined;
  const accentColor    = resolveAccentColor({
    planTier:          author.plan?.tier,
    customAccentColor: author.customAccentColor,
    siteTheme:         author.siteTheme,
  });

  const brandMark = author.logoUrl
    ? `<img src="${escapeHtml(author.logoUrl)}" alt="${escapeHtml(authorName)}" height="56" style="display:block;max-height:56px;width:auto;border:0;margin:0 auto;" />`
    : author.profileImageUrl
      ? `<img src="${escapeHtml(author.profileImageUrl)}" alt="${escapeHtml(authorName)}" width="60" height="60" style="display:block;width:60px;height:60px;border-radius:50%;border:0;object-fit:cover;margin:0 auto;" />`
      : `<table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td width="60" height="60" align="center" valign="middle" style="width:60px;height:60px;border-radius:50%;background:#ffffff;color:${accentColor};font-size:22px;font-weight:700;">${escapeHtml(initialsOf(authorName))}</td></tr></table>`;

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
            <p style="margin:16px 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65);">${escapeHtml(input.eyebrow)}</p>
            <p style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">${escapeHtml(authorName)}</p>
          </td>
        </tr>
        <tr><td style="padding:30px 40px 8px;">
          ${input.imageUrl ? `<img src="${escapeHtml(input.imageUrl)}" alt="${escapeHtml(title)}" style="display:block;width:100%;max-width:200px;border-radius:8px;margin:0 auto 20px;" />` : ""}
          <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;text-align:center;">${escapeHtml(title)}</p>
          ${input.subtitle ? `<p style="margin:0 0 20px;font-size:13px;color:#6b7280;text-align:center;font-weight:600;">${escapeHtml(input.subtitle)}</p>` : ""}
          ${input.description ? `<p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#374151;">${escapeHtml(input.description)}</p>` : ""}
          ${input.items && input.items.length > 0 ? `<ul style="margin:0 0 24px;padding:0 0 0 20px;font-size:15px;line-height:1.8;color:#374151;">${input.items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>` : ""}
        </td></tr>
        <tr><td style="padding:0 40px 32px;text-align:center;">
          <table cellpadding="0" cellspacing="0" align="center"><tr><td style="border-radius:999px;background:${accentColor};">
            <a href="${escapeHtml(targetUrl)}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(input.ctaLabel)} &rarr;</a>
          </td></tr></table>
        </td></tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              You're receiving this because ${escapeHtml(input.reason)}
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
      body: input.description ? `<p>${escapeHtml(input.description)}</p>` : null,
      categoryFilter: [tag],
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
        text: `${title}\n${input.subtitle ?? ""}\n\n${input.description ?? ""}${(input.items ?? []).map((i) => `\n- ${i}`).join("")}\n\n${input.ctaLabel}: ${targetUrl}\n\n---\nUnsubscribe: ${unsubscribeUrl}`,
      };
    });

    try {
      const result = await resend.batch.send(emails);
      if (result.error) {
        console.error(`[${input.logTag}] Resend batch error:`, result.error);
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
            .catch((e) => console.error(`[${input.logTag}] Failed to write CampaignSendLog rows:`, e));
        }
      }
    } catch (err) {
      console.error(`[${input.logTag}] Batch send failed:`, err);
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

  return { ok: true, sent, failed, total: subscribers.length };
}
