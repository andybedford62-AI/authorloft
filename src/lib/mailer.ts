/**
 * Email sender using Resend.
 * Requires: RESEND_API_KEY environment variable.
 *
 * If the var is absent the send call is a no-op so the app works
 * without email configured.
 */

import { Resend } from "resend";

const FROM_ADDRESS = process.env.SMTP_FROM || "AuthorLoft <noreply@authorloft.com>";

export function isSmtpConfigured() {
  return !!process.env.RESEND_API_KEY;
}

function baseUrl() {
  return (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
}

function wrapHtml(title: string, content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr>
          <td style="background:#1e40af;border-radius:12px 12px 0 0;padding:28px 36px;">
            <p style="margin:0;color:#93c5fd;font-size:13px;text-transform:uppercase;letter-spacing:1px;">AuthorLoft</p>
            <p style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700;">${title}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px;font-size:15px;line-height:1.7;color:#374151;border-radius:0 0 12px 12px;">
            ${content}
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              This email was sent by AuthorLoft &middot;
              <a href="${baseUrl()}" style="color:#6b7280;">authorloft.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

// ── Sale notification email (to author) ──────────────────────────────────────

export async function sendSaleNotificationEmail({
  to,
  authorName,
  customerEmail,
  customerName,
  bookTitle,
  itemLabel,
  priceCents,
  orderId,
}: {
  to: string;
  authorName: string;
  customerEmail: string;
  customerName?: string;
  bookTitle: string;
  itemLabel: string;
  priceCents: number;
  orderId: string;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const salesUrl = `https://www.${platformDomain}/admin/sales`;
  const dollars = (priceCents / 100).toFixed(2);
  const buyer = customerName ? `${customerName} (${customerEmail})` : customerEmail;
  const now = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return sendMail({
    to,
    subject: `💰 New sale — ${bookTitle} — $${dollars}`,
    text: [
      `Hi ${authorName},`,
      `You just made a sale!`,
      `Book: ${bookTitle} (${itemLabel})`,
      `Amount: $${dollars}`,
      `Buyer: ${buyer}`,
      `Date: ${now}`,
      `View all sales: ${salesUrl}`,
    ].join("\n\n"),
    html: wrapHtml("You just made a sale! 🎉", `
      <p style="margin:0 0 16px;">Hi ${authorName},</p>
      <p style="margin:0 0 24px;">Great news — someone just purchased one of your books on AuthorLoft!</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="font-size:13px;color:#6b7280;">Book</span><br/>
              <span style="font-size:15px;font-weight:600;color:#111827;">${bookTitle}</span>
              <span style="font-size:13px;color:#6b7280;margin-left:8px;">${itemLabel}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #d1fae5;">
              <span style="font-size:13px;color:#6b7280;">Amount</span><br/>
              <span style="font-size:22px;font-weight:700;color:#15803d;">$${dollars}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #d1fae5;">
              <span style="font-size:13px;color:#6b7280;">Buyer</span><br/>
              <span style="font-size:14px;color:#374151;">${buyer}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #d1fae5;">
              <span style="font-size:13px;color:#6b7280;">Date</span><br/>
              <span style="font-size:14px;color:#374151;">${now}</span>
            </td>
          </tr>
        </table>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${salesUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              View Sales Dashboard
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Order ID: <span style="font-family:monospace;">${orderId}</span>
      </p>
    `),
  });
}

// ── Transactional helpers ────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${baseUrl()}/reset-password/${token}`;
  return sendMail({
    to,
    subject: "Reset your AuthorLoft password",
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
    html: wrapHtml("Reset your password", `
      <p style="margin:0 0 16px;">We received a request to reset the password for your AuthorLoft account.</p>
      <p style="margin:0 0 24px;">Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 28px;">
            <a href="${resetUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Reset Password
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">If the button above doesn't work, paste this link into your browser:</p>
      <p style="margin:0 0 20px;font-size:13px;word-break:break-all;"><a href="${resetUrl}" style="color:#2563eb;">${resetUrl}</a></p>
      <p style="margin:0;font-size:13px;color:#6b7280;">If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
    `),
  });
}

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${baseUrl()}/verify-email/${token}`;
  return sendMail({
    to,
    subject: "Verify your AuthorLoft email address",
    text: `Verify your email: ${verifyUrl}\n\nThis link expires in 24 hours.\n\nIf you didn't sign up, ignore this email.`,
    html: wrapHtml("Verify your email address", `
      <p style="margin:0 0 16px;">Welcome to AuthorLoft! We just need to verify your email address to activate your account.</p>
      <p style="margin:0 0 24px;">Click the button below to confirm your email. This link expires in <strong>24 hours</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 28px;">
            <a href="${verifyUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Verify My Email
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">If the button above doesn't work, paste this link into your browser:</p>
      <p style="margin:0 0 20px;font-size:13px;word-break:break-all;"><a href="${verifyUrl}" style="color:#2563eb;">${verifyUrl}</a></p>
      <p style="margin:0;font-size:13px;color:#6b7280;">If you didn't create an AuthorLoft account, you can safely ignore this email.</p>
    `),
  });
}

// ── Purchase confirmation email ───────────────────────────────────────────────

export async function sendPurchaseConfirmationEmail({
  to,
  customerName,
  bookTitle,
  itemLabel,
  downloadUrl,
  downloadExpiry,
  authorName,
  authorSlug,
}: {
  to: string;
  customerName?: string;
  bookTitle: string;
  itemLabel: string;
  downloadUrl: string;
  downloadExpiry: Date;
  authorName: string;
  authorSlug: string;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const expiryStr = downloadExpiry.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const greeting = customerName ? `Hi ${customerName},` : "Hi there,";

  return sendMail({
    to,
    subject: `Your download is ready — ${bookTitle}`,
    text: [
      greeting,
      `Thank you for purchasing ${bookTitle} (${itemLabel}).`,
      `Download your file here: ${downloadUrl}`,
      `This link expires on ${expiryStr} and allows up to 5 downloads.`,
      `— ${authorName}`,
    ].join("\n\n"),
    html: wrapHtml(`Your download is ready`, `
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 16px;">
        Thank you for purchasing <strong>${bookTitle}</strong> (${itemLabel}).
        Your file is ready to download right now.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 28px;">
            <a href="${downloadUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              ⬇ Download ${itemLabel}
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">
        If the button above doesn't work, paste this link into your browser:
      </p>
      <p style="margin:0 0 24px;font-size:13px;word-break:break-all;">
        <a href="${downloadUrl}" style="color:#2563eb;">${downloadUrl}</a>
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#374151;">
          ⏱ <strong>Link expires:</strong> ${expiryStr}
        </p>
        <p style="margin:0;font-size:13px;color:#374151;">
          📥 <strong>Downloads allowed:</strong> 5
        </p>
      </div>
      <p style="margin:0 0 8px;font-size:14px;color:#374151;">
        Enjoy the read!<br/>
        <strong>${authorName}</strong>
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
        Visit the author's site:
        <a href="https://${authorSlug}.${platformDomain}" style="color:#6b7280;">
          ${authorSlug}.${platformDomain}
        </a>
      </p>
    `),
  });
}

// ── Core sendMail ────────────────────────────────────────────────────────────

/**
 * Send an email via Resend. Returns true on success, false if not configured
 * or send fails (errors are logged but not thrown so callers continue).
 */
export async function sendMail(opts: MailOptions): Promise<boolean> {
  if (!isSmtpConfigured()) {
    console.warn("[mailer] RESEND_API_KEY not set — email not sent to:", opts.to);
    return false;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
    });

    if (error) {
      console.error("[mailer] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mailer] Failed to send email:", err);
    return false;
  }
}
