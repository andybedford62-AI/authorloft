import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { Resend } from "resend";

function buildEmailHtml(opts: {
  authorName: string;
  accentColor: string;
  subject: string;
  body: string;
  unsubscribeUrl: string;
  siteUrl: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.subject}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:${opts.accentColor};border-radius:12px 12px 0 0;padding:28px 36px;">
            <a href="${opts.siteUrl}" style="text-decoration:none;">
              <p style="margin:0;color:rgba(255,255,255,0.7);font-size:13px;text-transform:uppercase;letter-spacing:1px;">
                Newsletter from
              </p>
              <p style="margin:4px 0 0;color:#ffffff;font-size:22px;font-weight:700;">
                ${opts.authorName}
              </p>
            </a>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px;font-size:15px;line-height:1.7;color:#374151;">
            ${opts.body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              You're receiving this because you subscribed to updates from ${opts.authorName}.
            </p>
            <p style="margin:8px 0 0;font-size:12px;">
              <a href="${opts.unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">
                Unsubscribe
              </a>
              &nbsp;·&nbsp;
              <a href="${opts.siteUrl}" style="color:#6b7280;text-decoration:underline;">
                Visit site
              </a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const BATCH_SIZE = 50;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;

  const newsletterCheck = await canUseFeature(authorId, "newsletter");
  if (!newsletterCheck.allowed) {
    return NextResponse.json({ error: newsletterCheck.reason }, { status: 403 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  const body = await req.json();
  const { subject, htmlBody, categoryFilter } = body;

  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!htmlBody?.trim() || htmlBody === "<p></p>") {
    return NextResponse.json({ error: "Email body cannot be empty." }, { status: 400 });
  }

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { id: true, name: true, displayName: true, accentColor: true, slug: true, contactEmail: true },
  });
  if (!author) return NextResponse.json({ error: "Author not found." }, { status: 404 });

  const subscriberWhere: Record<string, unknown> = { authorId, isConfirmed: true };
  if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
    subscriberWhere.OR = [
      { categoryPrefs: { isEmpty: true } },
      { categoryPrefs: { hasSome: categoryFilter } },
    ];
  }

  const subscribers = await prisma.subscriber.findMany({
    where:  subscriberWhere,
    select: { email: true, name: true, unsubscribeToken: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No confirmed subscribers to send to." }, { status: 400 });
  }

  const resend       = new Resend(process.env.RESEND_API_KEY);
  const authorName   = author.displayName || author.name;
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const siteUrl      = `https://${author.slug}.${platformDomain}`;
  const baseUrl      = process.env.NEXTAUTH_URL ?? "https://www.authorloft.com";
  const fromAddress  = `${authorName} via AuthorLoft <noreply@authorloft.com>`;
  const replyTo      = author.contactEmail ?? undefined;

  let sent   = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    const emails = batch.map((sub) => {
      const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}`;
      return {
        from:    fromAddress,
        to:      sub.email,
        subject,
        replyTo,
        html:    buildEmailHtml({ authorName, accentColor: author.accentColor || "#2563eb", subject, body: htmlBody, unsubscribeUrl, siteUrl }),
        text:    htmlToPlainText(htmlBody) + `\n\n---\nUnsubscribe: ${unsubscribeUrl}`,
      };
    });

    try {
      const result = await resend.batch.send(emails);
      if (result.error) {
        console.error("[newsletter] Resend batch error:", result.error);
        failed += batch.length;
      } else {
        // result.data is { data: Array<{ id: string }> }
        const emailResults: any[] = (result.data as any)?.data ?? [];
        const successCount = emailResults.filter((r) => r?.id).length;
        sent   += successCount;
        failed += batch.length - successCount;
      }
    } catch (err) {
      console.error("[newsletter] Batch send failed:", err);
      failed += batch.length;
    }

    // Small pause between batches
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Persist campaign record
  await prisma.campaign.create({
    data: {
      authorId,
      subject: subject.trim(),
      totalSent:     sent,
      totalFailed:   failed,
      totalTargeted: subscribers.length,
    },
  });

  return NextResponse.json({ sent, failed, total: subscribers.length });
}
