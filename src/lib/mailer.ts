/**
 * Email sender using Resend.
 * Requires: RESEND_API_KEY environment variable.
 *
 * If the var is absent the send call is a no-op so the app works
 * without email configured.
 */

import { Resend } from "resend";

const FROM_ADDRESS = process.env.SMTP_FROM || "AuthorLoft <noreply@authorloft.com>";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function isSmtpConfigured() {
  return !!process.env.RESEND_API_KEY;
}

function baseUrl() {
  return (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
}

export function wrapHtml(title: string, content: string) {
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
  const buyer = customerName ? `${esc(customerName)} (${esc(customerEmail)})` : esc(customerEmail);
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
      <p style="margin:0 0 16px;">Hi ${esc(authorName)},</p>
      <p style="margin:0 0 24px;">Great news — someone just purchased one of your books on AuthorLoft!</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="font-size:13px;color:#6b7280;">Book</span><br/>
              <span style="font-size:15px;font-weight:600;color:#111827;">${esc(bookTitle)}</span>
              <span style="font-size:13px;color:#6b7280;margin-left:8px;">${esc(itemLabel)}</span>
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

export async function sendWelcomeEmail(to: string, name: string, slug: string) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const dashboardUrl = `${baseUrl()}/admin/dashboard`;
  const publicSiteUrl = `https://${slug}.${platformDomain}`;
  const firstName = esc(name.split(" ")[0]);

  return sendMail({
    to,
    subject: "Welcome to AuthorLoft — your author site is ready!",
    text: [
      `Hi ${firstName},`,
      `Your email is verified and your AuthorLoft account is active.`,
      `Your author site is live at: ${publicSiteUrl}`,
      `Head to your dashboard to add books, customise your site, and more: ${dashboardUrl}`,
      `— The AuthorLoft Team`,
    ].join("\n\n"),
    html: wrapHtml("Welcome to AuthorLoft! 🎉", `
      <p style="margin:0 0 16px;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;">
        Your email is verified and your AuthorLoft account is all set.
        Your author site is already live — here's what to do next.
      </p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="font-size:13px;color:#0369a1;font-weight:600;">🌐 Your author site</span><br/>
              <a href="${publicSiteUrl}" style="font-size:15px;font-weight:600;color:#1e40af;text-decoration:none;">${publicSiteUrl}</a>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 8px;font-size:14px;color:#374151;font-weight:600;">Getting started:</p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
        <li>Add your first book from the <strong>Books</strong> menu</li>
        <li>Upload your author photo and bio in <strong>Appearance</strong></li>
        <li>Share your site link with readers</li>
      </ul>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 24px;">
            <a href="${dashboardUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Go to My Dashboard
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">
        Questions? Reply to this email — we're here to help.
      </p>
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
  const greeting = customerName ? `Hi ${esc(customerName)},` : "Hi there,";

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
        Thank you for purchasing <strong>${esc(bookTitle)}</strong> (${esc(itemLabel)}).
        Your file is ready to download right now.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 28px;">
            <a href="${downloadUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              ⬇ Download ${esc(itemLabel)}
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
        <strong>${esc(authorName)}</strong>
      </p>
      <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
        Visit the author's site:
        <a href="https://${authorSlug}.${platformDomain}" style="color:#6b7280;">
          ${authorSlug}.${platformDomain}
        </a>
      </p>
      <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">
        Need to re-download later? Visit
        <a href="https://www.${platformDomain}/orders/lookup" style="color:#6b7280;">
          authorloft.com/orders/lookup
        </a>
      </p>
    `),
  });
}

// ── Plan subscription welcome email (to author) ──────────────────────────────

export async function sendSubscriptionWelcomeEmail({
  to,
  authorName,
  planName,
  billingInterval,
  amountCents,
}: {
  to: string;
  authorName: string;
  planName: string;
  billingInterval: string;
  amountCents: number;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const dashboardUrl   = `https://www.${platformDomain}/admin/dashboard`;
  const firstName      = esc(authorName.split(" ")[0]);
  const dollars        = amountCents > 0 ? `$${(amountCents / 100).toFixed(2)}` : null;
  const period         = billingInterval === "annual" ? "year" : "month";

  return sendMail({
    to,
    subject: `You're now on the ${planName} plan — welcome!`,
    text: [
      `Hi ${firstName},`,
      `Your ${planName} subscription is now active.`,
      dollars ? `You'll be billed ${dollars} per ${period}.` : "",
      `Head to your dashboard to explore everything unlocked: ${dashboardUrl}`,
      `— The AuthorLoft Team`,
    ].filter(Boolean).join("\n\n"),
    html: wrapHtml(`Welcome to ${planName}! 🎉`, `
      <p style="margin:0 0 16px;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;">
        Your <strong>${esc(planName)}</strong> subscription is now active. Here's what you've unlocked:
      </p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="font-size:13px;color:#166534;">Plan</span><br/>
              <span style="font-size:16px;font-weight:700;color:#14532d;">${esc(planName)}</span>
            </td>
          </tr>
          ${dollars ? `
          <tr>
            <td style="padding:6px 0;border-top:1px solid #bbf7d0;">
              <span style="font-size:13px;color:#166534;">Billing</span><br/>
              <span style="font-size:15px;font-weight:600;color:#14532d;">${dollars} / ${period}</span>
            </td>
          </tr>` : ""}
        </table>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${dashboardUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Go to My Dashboard
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Questions? Reply to this email — we're happy to help.
      </p>
    `),
  });
}

// ── Payment failed email (to author) ─────────────────────────────────────────

export async function sendPaymentFailedEmail({
  to,
  authorName,
  amountCents,
  nextRetryDate,
}: {
  to: string;
  authorName: string;
  amountCents: number;
  nextRetryDate: Date | null;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const billingUrl     = `https://www.${platformDomain}/admin/settings`;
  const firstName      = esc(authorName.split(" ")[0]);
  const dollars        = amountCents > 0 ? `$${(amountCents / 100).toFixed(2)}` : "your subscription";
  const retryLine      = nextRetryDate
    ? `We'll automatically retry on <strong>${nextRetryDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>.`
    : "We'll automatically retry the payment shortly.";

  return sendMail({
    to,
    subject: "Action required — payment failed for your AuthorLoft subscription",
    text: [
      `Hi ${firstName},`,
      `We were unable to process your payment of ${dollars} for your AuthorLoft subscription.`,
      `Please update your payment method to keep your account active: ${billingUrl}`,
      `— The AuthorLoft Team`,
    ].join("\n\n"),
    html: wrapHtml("Payment failed — action required", `
      <p style="margin:0 0 16px;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;">
        We were unable to process your payment of <strong>${dollars}</strong> for your AuthorLoft subscription.
      </p>

      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#991b1b;">What happens next</p>
        <p style="margin:0 0 8px;font-size:13px;color:#7f1d1d;">${retryLine}</p>
        <p style="margin:0;font-size:13px;color:#7f1d1d;">
          If payment continues to fail, your account will be downgraded to the Free plan.
        </p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${billingUrl}"
               style="display:inline-block;background:#dc2626;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Update Payment Method
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Questions? Reply to this email — we're here to help.
      </p>
    `),
  });
}

// ── Renewal reminder email (to author) ──────────────────────────────────────

export async function sendRenewalReminderEmail({
  to,
  authorName,
  renewalDate,
  amountCents,
}: {
  to: string;
  authorName: string;
  renewalDate: Date;
  amountCents: number;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const billingUrl     = `https://www.${platformDomain}/admin/settings`;
  const firstName      = esc(authorName.split(" ")[0]);
  const dateStr        = renewalDate.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const dollars = amountCents > 0 ? `$${(amountCents / 100).toFixed(2)}` : null;
  const amountLine = dollars ? `Your plan will renew for <strong>${dollars}</strong>.` : "Your plan will renew automatically.";

  return sendMail({
    to,
    subject: `Your AuthorLoft subscription renews on ${dateStr}`,
    text: [
      `Hi ${firstName},`,
      `Just a heads-up — your AuthorLoft subscription renews on ${dateStr}.`,
      dollars ? `Amount: ${dollars}` : "",
      `No action is needed if you'd like to continue. To update your billing details or cancel, visit: ${billingUrl}`,
      `— The AuthorLoft Team`,
    ].filter(Boolean).join("\n\n"),
    html: wrapHtml("Your subscription is renewing soon", `
      <p style="margin:0 0 16px;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;">
        Just a friendly heads-up — your AuthorLoft subscription is coming up for renewal.
      </p>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="font-size:13px;color:#92400e;">Renewal date</span><br/>
              <span style="font-size:16px;font-weight:700;color:#78350f;">${dateStr}</span>
            </td>
          </tr>
          ${dollars ? `
          <tr>
            <td style="padding:6px 0;border-top:1px solid #fde68a;">
              <span style="font-size:13px;color:#92400e;">Amount</span><br/>
              <span style="font-size:16px;font-weight:700;color:#78350f;">${dollars}</span>
            </td>
          </tr>` : ""}
        </table>
      </div>

      <p style="margin:0 0 24px;font-size:14px;color:#374151;">
        ${amountLine} No action is needed if you'd like to continue — your site and books will keep running without interruption.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${billingUrl}"
               style="display:inline-block;background:#d97706;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Manage Billing
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Questions? Reply to this email — we're happy to help.
      </p>
    `),
  });
}

// ── Onboarding reminder email (to author) ────────────────────────────────────

export async function sendOnboardingReminderEmail(to: string, name: string, slug: string) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const dashboardUrl   = `${baseUrl()}/admin/books`;
  const publicSiteUrl  = `https://${slug}.${platformDomain}`;
  const firstName      = esc(name.split(" ")[0]);

  return sendMail({
    to,
    subject: "Your AuthorLoft site is waiting — add your first book",
    text: [
      `Hi ${firstName},`,
      `You signed up for AuthorLoft a week ago but haven't added any books yet.`,
      `Your author site is live at ${publicSiteUrl} — it just needs a book to really shine.`,
      `Add your first book here: ${dashboardUrl}`,
      `If you no longer need your account, you can simply ignore this email and it will be automatically removed in 7 days.`,
      `— The AuthorLoft Team`,
    ].join("\n\n"),
    html: wrapHtml("Your site is waiting for its first book", `
      <p style="margin:0 0 16px;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;">
        You signed up for AuthorLoft a week ago — great to have you! Your author site is live,
        but it's still waiting for its first book.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#374151;">
        Adding a book takes just a few minutes and brings your site to life for readers.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 24px;">
            <a href="${dashboardUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Add My First Book
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-align:center;">
        Your site: <a href="${publicSiteUrl}" style="color:#1d4ed8;">${publicSiteUrl}</a>
      </p>
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        If you no longer need your account, simply ignore this email — it will be automatically removed in 7 days.
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
