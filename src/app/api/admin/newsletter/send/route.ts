import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import nodemailer from "nodemailer";

function isSmtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function createTransport() {
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;

  // Plan gate: newsletter feature must be enabled
  const newsletterCheck = await canUseFeature(authorId, "newsletter");
  if (!newsletterCheck.allowed) {
    return NextResponse.json({ error: newsletterCheck.reason }, { status: 403 });
  }

  if (!isSmtpConfigured()) {
    return NextResponse.json(
      { error: "SMTP is not configured. Add SMTP_HOST, SMTP_USER, and SMTP_PASS to your .env.local file." },
      { status: 422 }
    );
  }

  const body = await req.json();
  const { subject, htmlBody, categoryFilter } = body;

  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!htmlBody?.trim() || htmlBody === "<p></p>") {
    return NextResponse.json({ error: "Email body cannot be empty." }, { status: 400 });
  }

  // Get author info
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: {
      id: true,
      name: true,
      displayName: true,
      accentColor: true,
      slug: true,
      contactEmail: true,
    },
  });
  if (!author) return NextResponse.json({ error: "Author not found." }, { status: 404 });

  // Build subscriber query
  const subscriberWhere: Record<string, unknown> = { authorId, isConfirmed: true };
  if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
    // Only subscribers who have at least one of the selected category preferences
    // or who have no preferences (they opted in for everything)
    subscriberWhere.OR = [
      { categoryPrefs: { isEmpty: true } },
      { categoryPrefs: { hasSome: categoryFilter } },
    ];
  }

  const subscribers = await prisma.subscriber.findMany({
    where: subscriberWhere,
    select: { email: true, name: true, unsubscribeToken: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No confirmed subscribers to send to." }, { status: 400 });
  }

  const transport = createTransport();
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const siteUrl = `http://${author.slug}.${new URL(baseUrl).hostname}:${new URL(baseUrl).port || 80}`;
  const authorName = author.displayName || author.name;
  const fromAddress = process.env.SMTP_FROM || `${authorName} <${process.env.SMTP_USER}>`;

  let sent = 0;
  let failed = 0;

  // Send in small batches to avoid overwhelming the SMTP server
  const BATCH_SIZE = 20;
  const BATCH_DELAY_MS = 500;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (sub) => {
        const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}`;
        const html = buildEmailHtml({
          authorName,
          accentColor: author.accentColor || "#7B2D2D",
          subject,
          body: htmlBody,
          unsubscribeUrl,
          siteUrl,
        });
        const plainText =
          htmlToPlainText(htmlBody) +
          `\n\n---\nUnsubscribe: ${unsubscribeUrl}`;

        try {
          await transport.sendMail({
            from: fromAddress,
            to: sub.email,
            subject,
            text: plainText,
            html,
          });
          sent++;
        } catch (err) {
          console.error(`[newsletter] Failed to send to ${sub.email}:`, err);
          failed++;
        }
      })
    );

    // Pause between batches (skip after the last one)
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  return NextResponse.json({ sent, failed, total: subscribers.length });
}
