/**
 * Email sender using Resend.
 * Requires: RESEND_API_KEY environment variable.
 *
 * If the var is absent the send call is a no-op so the app works
 * without email configured.
 */

import { Resend } from "resend";
import { prisma } from "./db";
import { sanitize } from "./sanitize";
import { htmlToText } from "./newsletter-format";

const FROM_ADDRESS           = process.env.SMTP_FROM || "AuthorLoft <noreply@authorloft.com>";
const WELCOME_FROM_ADDRESS   = "AuthorLoft <welcome@authorloft.com>";
const BROADCAST_FROM_ADDRESS = "AuthorLoft <hello@authorloft.com>";

export function buildUnsubscribeLink(token: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
  return `${base}/api/unsubscribe/platform?token=${token}`;
}

export function buildNewsConfirmLink(token: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
  return `${base}/api/news/confirm?token=${token}`;
}

export function buildAuthorNewsletterConfirmLink(token: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
  return `${base}/api/newsletter/confirm?token=${token}`;
}

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
  from?: string;
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

// ── Course sale/enrollment notification (to author) — free or paid ───────────

export async function sendCourseSaleNotificationEmail({
  to,
  authorName,
  customerEmail,
  customerName,
  courseTitle,
  priceCents,
  orderId,
}: {
  to: string;
  authorName: string;
  customerEmail: string;
  customerName?: string;
  courseTitle: string;
  priceCents: number;
  orderId?: string;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const salesUrl = `https://www.${platformDomain}/admin/sales`;
  const isFree = priceCents === 0;
  const dollars = (priceCents / 100).toFixed(2);
  const buyer = customerName ? `${esc(customerName)} (${esc(customerEmail)})` : esc(customerEmail);
  const now = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return sendMail({
    to,
    subject: isFree ? `🎓 New enrollment — ${courseTitle}` : `💰 New sale — ${courseTitle} — $${dollars}`,
    text: [
      `Hi ${authorName},`,
      isFree ? `Someone just enrolled in your course!` : `You just made a sale!`,
      `Course: ${courseTitle}`,
      isFree ? null : `Amount: $${dollars}`,
      `${isFree ? "Student" : "Buyer"}: ${buyer}`,
      `Date: ${now}`,
      `View all sales: ${salesUrl}`,
    ].filter((line): line is string => line !== null).join("\n\n"),
    html: wrapHtml(isFree ? "New course enrollment! 🎓" : "You just made a sale! 🎉", `
      <p style="margin:0 0 16px;">Hi ${esc(authorName)},</p>
      <p style="margin:0 0 24px;">${isFree ? "Someone just enrolled in your course on AuthorLoft!" : "Great news — someone just purchased your course on AuthorLoft!"}</p>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="font-size:13px;color:#6b7280;">Course</span><br/>
              <span style="font-size:15px;font-weight:600;color:#111827;">${esc(courseTitle)}</span>
            </td>
          </tr>
          ${isFree ? "" : `
          <tr>
            <td style="padding:6px 0;border-top:1px solid #d1fae5;">
              <span style="font-size:13px;color:#6b7280;">Amount</span><br/>
              <span style="font-size:22px;font-weight:700;color:#15803d;">$${dollars}</span>
            </td>
          </tr>`}
          <tr>
            <td style="padding:6px 0;border-top:1px solid #d1fae5;">
              <span style="font-size:13px;color:#6b7280;">${isFree ? "Student" : "Buyer"}</span><br/>
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
      ${orderId ? `
      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Order ID: <span style="font-family:monospace;">${orderId}</span>
      </p>` : ""}
    `),
  });
}

// ── New signup notification (to super admin) ─────────────────────────────────

export async function sendNewSignupNotificationEmail({
  to,
  authorName,
  authorEmail,
  slug,
  method,
}: {
  to: string;
  authorName: string;
  authorEmail: string;
  slug: string;
  method: "email" | "google";
}) {
  if (!to) return;

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const profileUrl     = `https://www.${platformDomain}/super-admin/authors`;
  const siteUrl        = `https://${slug}.${platformDomain}`;

  return sendMail({
    to,
    subject: `New signup: ${authorName} (${authorEmail})`,
    text: [
      `A new author just signed up on AuthorLoft.`,
      `Name:   ${authorName}`,
      `Email:  ${authorEmail}`,
      `Site:   ${siteUrl}`,
      `Method: ${method === "google" ? "Google OAuth" : "Email / Password"}`,
      `View all authors: ${profileUrl}`,
    ].join("\n"),
    html: wrapHtml("New Author Signup 🎉", `
      <p style="margin:0 0 16px;">A new author just created an account on AuthorLoft.</p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="font-size:13px;color:#0369a1;">Name</span><br/>
              <span style="font-size:15px;font-weight:600;color:#111827;">${esc(authorName)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #bae6fd;">
              <span style="font-size:13px;color:#0369a1;">Email</span><br/>
              <span style="font-size:14px;color:#374151;">${esc(authorEmail)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #bae6fd;">
              <span style="font-size:13px;color:#0369a1;">Author Site</span><br/>
              <a href="${siteUrl}" style="font-size:14px;color:#1d4ed8;">${siteUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #bae6fd;">
              <span style="font-size:13px;color:#0369a1;">Signup Method</span><br/>
              <span style="font-size:14px;color:#374151;">${method === "google" ? "Google OAuth" : "Email / Password"}</span>
            </td>
          </tr>
        </table>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${profileUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              View All Authors
            </a>
          </td>
        </tr>
      </table>
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

const DEFAULT_WELCOME_SUBJECT = "🎉 Welcome to AuthorLoft — your author site is live!";
const DEFAULT_WELCOME_BODY = `Hi {{firstName}},

Congratulations — your AuthorLoft account is active and your author site is already live on the internet.

Your site: {{siteUrl}}

─── Your first 3 steps ───

1. Add your books — Head to the Books menu and add your first title. Include a cover, description, and buy links.
2. Personalise your site — Upload your author photo, write your bio, and set your accent colour in Appearance.
3. Share your link — Post your site URL on social, add it to your email signature, and tell your readers.

─── When you're ready to grow ───

Your free plan is a great start. Here's what unlocks on Standard ($19.99/mo):
• Sell books directly — Keep more revenue. No middlemen.
• Custom domain — Use your own authorname.com address.
• Up to 20 books — Room to grow your catalog.

And on Premium ($59.99/mo): unlimited books plus full analytics so you can see exactly who's finding you and where they come from.

No pressure — upgrade whenever it makes sense.

Questions? Just reply to this email — we read every one.

— The AuthorLoft Team`;

function substituteVars(template: string, vars: Record<string, string>): string {
  // Case/whitespace-tolerant — {{firstName}}, {{FirstName}}, {{ SITEURL }} all resolve
  const lowerVars: Record<string, string> = {};
  for (const key in vars) lowerVars[key.toLowerCase()] = vars[key];
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => lowerVars[key.toLowerCase()] ?? match);
}

function plainTextToHtml(text: string): string {
  return text
    .split("\n")
    .map(line => `<p style="margin:0 0 10px;font-size:14px;color:#374151;line-height:1.6;">${esc(line) || "&nbsp;"}</p>`)
    .join("\n");
}

export async function sendWelcomeEmail(to: string, name: string, slug: string) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const dashboardUrl   = `${baseUrl()}/admin/dashboard`;
  const siteUrl        = `https://${slug}.${platformDomain}`;
  const firstName      = name.split(" ")[0];

  // Load custom template from DB (falls back to default if not set)
  let subject = DEFAULT_WELCOME_SUBJECT;
  let bodyText = DEFAULT_WELCOME_BODY;
  try {
    const config = await prisma.systemConfig.findUnique({
      where:  { id: "main" },
      select: { welcomeEmailSubject: true, welcomeEmailBody: true },
    });
    if (config?.welcomeEmailSubject) subject  = config.welcomeEmailSubject;
    if (config?.welcomeEmailBody)    bodyText = config.welcomeEmailBody;
  } catch {
    // DB unavailable — use defaults
  }

  const vars = { firstName, siteUrl, dashboardUrl };
  const resolvedSubject = substituteVars(subject,  vars);
  const resolvedBody    = substituteVars(bodyText, vars);

  return sendMail({
    to,
    from:    WELCOME_FROM_ADDRESS,
    subject: resolvedSubject,
    text:    resolvedBody,
    html: wrapHtml("Welcome to AuthorLoft! 🎉", `
      ${plainTextToHtml(resolvedBody)}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:16px 0 8px;">
            <a href="${dashboardUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Go to My Dashboard
            </a>
          </td>
        </tr>
      </table>
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

// ── AuthorLoft News double opt-in confirmation ────────────────────────────────

export async function sendNewsSubscriptionConfirmationEmail({
  to,
  name,
  confirmUrl,
}: {
  to: string;
  name?: string | null;
  confirmUrl: string;
}) {
  const greeting = name ? `Hi ${esc(name)},` : "Hi there,";
  return sendMail({
    to,
    subject: "Confirm your AuthorLoft News subscription",
    text: `${greeting}\n\nPlease confirm your subscription to AuthorLoft News: ${confirmUrl}\n\nIf you didn't sign up, ignore this email — you won't be subscribed unless you click the link.`,
    html: wrapHtml("Confirm your subscription", `
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 24px;">One more step — confirm your email to start receiving AuthorLoft News.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 28px;">
            <a href="${confirmUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Confirm Subscription
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">If the button above doesn't work, paste this link into your browser:</p>
      <p style="margin:0 0 20px;font-size:13px;word-break:break-all;"><a href="${confirmUrl}" style="color:#2563eb;">${confirmUrl}</a></p>
      <p style="margin:0;font-size:13px;color:#6b7280;">If you didn't sign up for AuthorLoft News, you can safely ignore this email — you won't be subscribed unless you click the link above.</p>
    `),
  });
}

// ── Author-site newsletter double opt-in confirmation ─────────────────────────
// Sent from the same address/display-name pattern as the author's actual
// newsletter sends (see buildEmailHtml's fromAddress) so it's recognizable
// when the real newsletter arrives later. Every author's sends share
// noreply@authorloft.com, so an unconfirmed/dirty list on one author's site
// risks deliverability for every other author on the platform -- this closes
// that gap the same way the platform-level News list already was.

export async function sendAuthorNewsletterConfirmationEmail({
  to,
  name,
  authorName,
  confirmUrl,
}: {
  to: string;
  name?: string | null;
  authorName: string;
  confirmUrl: string;
}) {
  const greeting = name ? `Hi ${esc(name)},` : "Hi there,";
  return sendMail({
    to,
    from: `${authorName} via AuthorLoft <noreply@authorloft.com>`,
    subject: `Confirm your subscription to ${authorName}'s newsletter`,
    text: `${greeting}\n\nPlease confirm your subscription to ${authorName}'s newsletter: ${confirmUrl}\n\nIf you didn't sign up, ignore this email — you won't be subscribed unless you click the link.`,
    html: wrapHtml("Confirm your subscription", `
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 24px;">One more step — confirm your email to start receiving updates from <strong>${esc(authorName)}</strong>.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 28px;">
            <a href="${confirmUrl}" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Confirm Subscription
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">If the button above doesn't work, paste this link into your browser:</p>
      <p style="margin:0 0 20px;font-size:13px;word-break:break-all;"><a href="${confirmUrl}" style="color:#2563eb;">${confirmUrl}</a></p>
      <p style="margin:0;font-size:13px;color:#6b7280;">If you didn't sign up for this newsletter, you can safely ignore this email — you won't be subscribed unless you click the link above.</p>
    `),
  });
}

// ── Order confirmation email (single receipt for all items) ─────────────────

export interface OrderItemForEmail {
  bookTitle: string;
  itemLabel: string;
  downloadUrl: string;
  authorName: string;
  authorSlug: string;
  priceCents: number;
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  items,
  totalCents,
  discountCents,
  downloadExpiry,
  orderId,
}: {
  to: string;
  customerName?: string;
  items: OrderItemForEmail[];
  totalCents: number;
  discountCents: number;
  downloadExpiry: Date;
  orderId: string;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const expiryStr = downloadExpiry.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const greeting = customerName ? `Hi ${esc(customerName)},` : "Hi there,";
  const subtotalStr = (totalCents / 100).toFixed(2);
  const discountStr = discountCents > 0 ? (discountCents / 100).toFixed(2) : null;
  const totalStr = ((totalCents - discountCents) / 100).toFixed(2);

  const itemsHtml = items.map((item, i) => `
    <tr ${i > 0 ? 'style="border-top:1px solid #e5e7eb;"' : ""}>
      <td style="padding:12px 0;">
        <div style="font-weight:600;color:#111827;">${esc(item.bookTitle)}</div>
        <div style="font-size:13px;color:#6b7280;margin:4px 0 8px;">${esc(item.itemLabel)} — ${esc(item.authorName)}</div>
        <a href="${item.downloadUrl}"
           style="display:inline-block;background:#3b82f6;color:#ffffff;font-size:13px;font-weight:600;padding:8px 20px;border-radius:6px;text-decoration:none;margin-top:4px;">
          Download
        </a>
      </td>
      <td style="padding:12px 0;text-align:right;color:#111827;font-weight:600;">
        $${(item.priceCents / 100).toFixed(2)}
      </td>
    </tr>
  `).join("");

  const itemsText = items.map(item =>
    `${item.bookTitle} (${item.itemLabel})\n  Author: ${item.authorName}\n  Price: $${(item.priceCents / 100).toFixed(2)}\n  Download: ${item.downloadUrl}`
  ).join("\n\n");

  return sendMail({
    to,
    subject: `Order confirmation #${orderId.slice(-8).toUpperCase()} — AuthorLoft`,
    text: [
      greeting,
      `Thank you for your purchase! Your order has been confirmed.`,
      ``,
      `Order #${orderId}`,
      `Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      ``,
      `Items:`,
      itemsText,
      ``,
      `Subtotal: $${subtotalStr}`,
      discountStr ? `Discount: -$${discountStr}` : "",
      `Total: $${totalStr}`,
      ``,
      `Download links expire on ${expiryStr}.`,
      `You can re-download anytime at: https://www.${platformDomain}/orders/lookup`,
    ].filter(Boolean).join("\n"),
    html: wrapHtml("Order Confirmed", `
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 24px;">Thank you for your purchase! Your download links are ready below.</p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#0369a1;">Order #</td>
            <td style="text-align:right;font-size:13px;font-weight:600;color:#0369a1;">${orderId.slice(-8).toUpperCase()}</td>
          </tr>
          <tr style="border-top:1px solid #bae6fd;">
            <td style="padding:6px 0;font-size:13px;color:#0369a1;">Date</td>
            <td style="padding:6px 0;text-align:right;font-size:13px;font-weight:600;color:#0369a1;">
              ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#374151;">Your Items:</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemsHtml}
      </table>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#6b7280;">Subtotal</td>
            <td style="text-align:right;font-size:13px;color:#6b7280;">$${subtotalStr}</td>
          </tr>
          ${discountStr ? `
          <tr style="border-top:1px solid #e5e7eb;">
            <td style="padding:6px 0;font-size:13px;color:#16a34a;font-weight:600;">Discount</td>
            <td style="padding:6px 0;text-align:right;font-size:13px;color:#16a34a;font-weight:600;">-$${discountStr}</td>
          </tr>` : ""}
          <tr style="border-top:1px solid #e5e7eb;">
            <td style="padding:8px 0;font-size:15px;font-weight:700;color:#111827;">Total</td>
            <td style="padding:8px 0;text-align:right;font-size:15px;font-weight:700;color:#111827;">$${totalStr}</td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 16px;font-size:13px;color:#374151;">
        <strong>📥 Download links expire:</strong> ${expiryStr}<br/>
        <strong>💾 Downloads allowed:</strong> 5 per item
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="https://www.${platformDomain}/orders/lookup"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Re-download Later
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

// ── Purchase confirmation email (legacy — single item) ───────────────────────

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
  // Delegate to sendOrderConfirmationEmail for consistency
  return sendOrderConfirmationEmail({
    to,
    customerName,
    items: [{
      bookTitle,
      itemLabel,
      downloadUrl,
      authorName,
      authorSlug,
      priceCents: 0, // Price shown per-item doesn't make sense for single item anyway
    }],
    totalCents: 0,
    discountCents: 0,
    downloadExpiry,
    orderId: "",
  });
}

// ── Course access email (to buyer) ──────────────────────────────────────────

export async function sendCourseAccessEmail({
  to,
  customerName,
  courseTitle,
  authorName,
  accessUrl,
  isPaid,
  priceCents,
}: {
  to: string;
  customerName?: string;
  courseTitle: string;
  authorName: string;
  accessUrl: string;
  isPaid: boolean;
  priceCents?: number;
}) {
  const greeting = customerName ? `Hi ${esc(customerName)},` : "Hi there,";
  const priceStr = isPaid && priceCents ? `$${(priceCents / 100).toFixed(2)}` : "Free";
  const enrollType = isPaid ? "Your purchase is confirmed" : "You're enrolled";

  return sendMail({
    to,
    subject: `Your course access: ${courseTitle} — AuthorLoft`,
    text: [
      greeting,
      ``,
      `${enrollType}! You now have access to "${courseTitle}" by ${authorName}.`,
      ``,
      `Access your course here:`,
      accessUrl,
      ``,
      `Enrollment: ${priceStr}`,
      ``,
      `Save this email — use the link above anytime to return to your course.`,
      ``,
      `Questions? Reply to this email — we're here to help.`,
    ].join("\n"),
    html: wrapHtml("Course Access", `
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 8px;">${enrollType}! You now have access to:</p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111827;">${esc(courseTitle)}</p>
        <p style="margin:0;font-size:14px;color:#6b7280;">by ${esc(authorName)}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#0369a1;font-weight:600;">${priceStr}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:0 0 24px;">
            <a href="${accessUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              🎓 Access Your Course
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 16px;font-size:13px;color:#374151;">
        <strong>📌 Bookmark this email</strong> — use the button above anytime to return to your course. No login required.
      </p>

      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Questions? Reply to this email — we're here to help.
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

// ── Onboarding early reminder email — day 3 (to author) ──────────────────────

export async function sendOnboardingEarlyReminderEmail(to: string, name: string, slug: string) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const dashboardUrl   = `${baseUrl()}/admin/books/new`;
  const publicSiteUrl  = `https://${slug}.${platformDomain}`;
  const firstName      = esc(name.split(" ")[0]);

  return sendMail({
    to,
    subject: `${firstName}, your author site is live — add your first book`,
    text: [
      `Hi ${firstName},`,
      `Your AuthorLoft site went live 3 days ago at ${publicSiteUrl}.`,
      `The only thing missing is a book — once you add one, readers can find you and your site really comes together.`,
      `It only takes a few minutes: ${dashboardUrl}`,
      `— The AuthorLoft Team`,
    ].join("\n\n"),
    html: wrapHtml("Your site is live — add your first book", `
      <p style="margin:0 0 16px;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;">
        Your AuthorLoft site went live 3 days ago at
        <a href="${publicSiteUrl}" style="color:#1d4ed8;">${publicSiteUrl}</a> —
        exciting stuff!
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#374151;">
        The only thing missing is a book. Once you add one, readers can discover you
        and your site really comes to life. It only takes a few minutes.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 28px;">
            <a href="${dashboardUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
              Add My First Book
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        Questions? Just reply to this email — we're happy to help.
      </p>
    `),
  });
}

// ── Below-minimum pricing alert (to author) ──────────────────────────────────

export async function sendBelowMinimumPricingAlert({
  to,
  authorName,
  bookTitle,
  itemLabel,
  originalPriceCents,
  chargedCents,
  orderId,
}: {
  to: string;
  authorName: string;
  bookTitle: string;
  itemLabel: string;
  originalPriceCents: number;
  chargedCents: number;
  orderId: string;
}) {
  const originalPrice = (originalPriceCents / 100).toFixed(2);
  const chargedPrice = (chargedCents / 100).toFixed(2);
  const settingsUrl = "https://www.authorloft.com/admin/books";

  return sendMail({
    to,
    subject: `⚠️  Pricing Alert — ${bookTitle} charged at minimum`,
    text: [
      `Hi ${authorName},`,
      `A sale just completed for "${bookTitle}" (${itemLabel}), but we wanted to alert you to a pricing issue:`,
      `Original Price: $${originalPrice}`,
      `Stripe Minimum: $0.50`,
      `Amount Charged: $${chargedPrice}`,
      `This happened because Stripe requires a $0.50 minimum per transaction. We recommend setting your book prices to $0.50 or higher to avoid this in the future.`,
      `Review your pricing: ${settingsUrl}`,
    ].join("\n\n"),
    html: wrapHtml("Pricing Alert ⚠️", `
      <p style="margin:0 0 16px;">Hi ${esc(authorName)},</p>
      <p style="margin:0 0 24px;">A sale just completed for <strong>"${esc(bookTitle)}"</strong>, but we wanted to alert you to a pricing issue.</p>

      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:20px;margin:0 0 24px;">
        <p style="margin:0 0 12px;font-weight:600;color:#92400e;">Stripe Minimum Charge</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="font-size:13px;color:#78350f;">Your Price</span><br/>
              <span style="font-size:15px;font-weight:600;color:#111827;">$${originalPrice}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #fde68a;">
              <span style="font-size:13px;color:#78350f;">Stripe Minimum</span><br/>
              <span style="font-size:15px;font-weight:600;color:#111827;">$0.50</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #fde68a;">
              <span style="font-size:13px;color:#78350f;">Amount Charged</span><br/>
              <span style="font-size:18px;font-weight:700;color:#d97706;">$${chargedPrice}</span>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 16px;color:#374151;">Stripe requires a <strong>$0.50 minimum</strong> per transaction. We recommend setting your book prices to <strong>$0.50 or higher</strong> to avoid this in the future.</p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${settingsUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Update Pricing
            </a>
          </td>
        </tr>
      </table>
    `),
  });
}

// ── Trial expiry warning email (7 days before) ───────────────────────────────

export async function sendTrialExpiryWarningEmail({
  to,
  authorName,
  planName,
  expiryDate,
  daysRemaining,
}: {
  to: string;
  authorName: string;
  planName: string;
  expiryDate: Date;
  daysRemaining: number;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const billingUrl     = `https://www.${platformDomain}/admin/settings`;
  const firstName      = esc(authorName.split(" ")[0]);
  const dateStr        = expiryDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const dayWord        = daysRemaining === 1 ? "day" : "days";

  return sendMail({
    to,
    subject: `Your ${planName} trial ends in ${daysRemaining} ${dayWord}`,
    text: [
      `Hi ${firstName},`,
      `Just a heads-up — your complimentary ${planName} trial on AuthorLoft ends in ${daysRemaining} ${dayWord} (${dateStr}).`,
      `After that, your account will revert to the Free plan. To keep all your ${planName} features, subscribe before the trial expires.`,
      `Upgrade here: ${billingUrl}`,
      `— The AuthorLoft Team`,
    ].join("\n\n"),
    html: wrapHtml(`Your ${planName} trial ends soon`, `
      <p style="margin:0 0 16px;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;">
        Your complimentary <strong>${esc(planName)}</strong> trial is coming to an end.
      </p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:6px 0;">
              <span style="font-size:13px;color:#1e40af;">Trial expires</span><br/>
              <span style="font-size:16px;font-weight:700;color:#1e3a8a;">${dateStr}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;border-top:1px solid #bfdbfe;">
              <span style="font-size:13px;color:#1e40af;">Days remaining</span><br/>
              <span style="font-size:16px;font-weight:700;color:#1e3a8a;">${daysRemaining} ${dayWord}</span>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 24px;font-size:14px;color:#374151;">
        After your trial ends, your account will automatically revert to the Free plan.
        To keep all your <strong>${esc(planName)}</strong> features — including premium themes, custom domain, and direct sales — subscribe before ${dateStr}.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${billingUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Upgrade My Plan
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

// ── Trial ended email ─────────────────────────────────────────────────────────

export async function sendTrialEndedEmail({
  to,
  authorName,
  planName,
}: {
  to: string;
  authorName: string;
  planName: string;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const billingUrl     = `https://www.${platformDomain}/admin/settings`;
  const firstName      = esc(authorName.split(" ")[0]);

  return sendMail({
    to,
    subject: `Your ${planName} trial has ended`,
    text: [
      `Hi ${firstName},`,
      `Your complimentary ${planName} trial on AuthorLoft has ended. Your account has been moved back to the Free plan.`,
      `To restore your ${planName} features, subscribe at any time: ${billingUrl}`,
      `Your books and content are safe — nothing has been deleted.`,
      `— The AuthorLoft Team`,
    ].join("\n\n"),
    html: wrapHtml(`Your ${planName} trial has ended`, `
      <p style="margin:0 0 16px;">Hi ${firstName},</p>
      <p style="margin:0 0 16px;">
        Your complimentary <strong>${esc(planName)}</strong> trial on AuthorLoft has ended.
        Your account has been moved back to the <strong>Free plan</strong>.
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;color:#374151;">
          <strong>Don't worry</strong> — all your books, posts, and content are safe.
          Premium features (custom domain, premium themes, direct sales) are paused until you upgrade.
        </p>
      </div>

      <p style="margin:0 0 24px;font-size:14px;color:#374151;">
        Ready to continue with <strong>${esc(planName)}</strong>? Subscribe anytime to restore full access instantly.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${billingUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              View Plans &amp; Upgrade
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
      from: opts.from ?? FROM_ADDRESS,
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

// ── Platform broadcast email ──────────────────────────────────────────────────

export function buildPlatformBroadcastEmail(opts: {
  firstName: string;
  subject: string;
  body: string; // HTML from the admin rich text editor
  unsubscribeUrl?: string;
}): { html: string; text: string } {
  // Sanitized and embedded directly (same pattern as author newsletters) —
  // Tiptap already outputs email-safe markup (inline styles for color/
  // highlight/alignment, semantic tags for bold/italic/lists), so no extra
  // per-element styling is needed beyond what wrapHtml's card already sets.
  const safeBody = sanitize(opts.body);

  // Personal 1:1 sends omit the "announcements" unsubscribe footer — it reads
  // as an automated blast rather than a direct note when there's no list to leave.
  const html = wrapHtml(opts.subject, `
    <div class="rich-content">${safeBody}</div>
    ${opts.unsubscribeUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr>
        <td align="center" style="padding:8px 0 24px;">
          <a href="${opts.unsubscribeUrl}"
             style="font-size:12px;color:#9ca3af;text-decoration:underline;">
            Unsubscribe from AuthorLoft announcements
          </a>
        </td>
      </tr>
    </table>` : ""}
  `);

  const text = htmlToText(opts.body) + (opts.unsubscribeUrl ? `\n\n---\nUnsubscribe: ${opts.unsubscribeUrl}` : "");

  return { html, text };
}

// ── Pre-order launch notification (to reader who signed up) ──────────────────

export async function sendPreOrderLaunchEmail({
  to,
  readerName,
  bookTitle,
  authorName,
  bookUrl,
  coverImageUrl,
}: {
  to: string;
  readerName?: string | null;
  bookTitle: string;
  authorName: string;
  bookUrl: string;
  coverImageUrl?: string | null;
}) {
  const greeting = readerName ? `Hi ${esc(readerName)},` : "Hi there,";

  return sendMail({
    to,
    subject: `It's here! "${bookTitle}" is now available`,
    text: [
      greeting,
      `Great news — "${bookTitle}" by ${authorName} is now available!`,
      ``,
      `You signed up to be notified when this book launched, and the wait is over.`,
      ``,
      `Get it here: ${bookUrl}`,
      ``,
      `— ${authorName}`,
    ].join("\n"),
    html: wrapHtml("It's available now!", `
      <p style="margin:0 0 16px;">${greeting}</p>
      <p style="margin:0 0 20px;">
        Great news — <strong>${esc(bookTitle)}</strong> by ${esc(authorName)} is now available!
        You signed up to be notified when this book launched, and the wait is over.
      </p>
      ${coverImageUrl ? `
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:20px;">
          <img src="${coverImageUrl}" alt="${esc(bookTitle)}" style="max-width:160px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
        </td></tr>
      </table>` : ""}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${bookUrl}"
               style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Get the Book
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        You're receiving this because you signed up for launch notifications on ${esc(bookTitle)}.
      </p>
    `),
  });
}

// ── Gated resource download delivery (to the lead) ───────────────────────────

export async function sendResourceDownloadEmail({
  to,
  title,
  fileUrl,
  coverImageUrl,
}: {
  to: string;
  title: string;
  fileUrl: string;
  coverImageUrl?: string | null;
}) {
  const resourcesUrl = `${baseUrl()}/resources`;

  return sendMail({
    to,
    from: BROADCAST_FROM_ADDRESS,
    subject: `Your download: ${title}`,
    text: [
      `Hi there,`,
      `Thanks for downloading "${title}" from AuthorLoft.`,
      `Here's your copy — keep this email so you can grab it again anytime:`,
      fileUrl,
      `Browse more free resources: ${resourcesUrl}`,
      `— The AuthorLoft Team`,
    ].join("\n\n"),
    html: wrapHtml("Your download is ready", `
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 20px;">
        Thanks for downloading <strong>${esc(title)}</strong> from AuthorLoft.
        Here's your copy — keep this email so you can grab it again anytime.
      </p>
      ${coverImageUrl ? `
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:20px;">
          <img src="${coverImageUrl}" alt="${esc(title)}" style="max-width:200px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);" />
        </td></tr>
      </table>` : ""}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${fileUrl}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Download ${esc(title)}
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">If the button doesn't work, paste this link into your browser:</p>
      <p style="margin:0 0 20px;font-size:13px;word-break:break-all;"><a href="${fileUrl}" style="color:#2563eb;">${fileUrl}</a></p>
      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
        Looking for more? <a href="${resourcesUrl}" style="color:#6b7280;">Browse all free resources</a>.
      </p>
    `),
  });
}

// ── Reader Magnet download delivery ──────────────────────────────────────────

export async function sendReaderMagnetEmail({
  to,
  authorName,
  bookTitle,
  coverImageUrl,
  downloadUrl,
  downloadExpiry,
}: {
  to: string;
  authorName: string;
  bookTitle: string;
  coverImageUrl?: string | null;
  downloadUrl: string;
  downloadExpiry: Date;
}) {
  const expiryStr = downloadExpiry.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return sendMail({
    to,
    from: BROADCAST_FROM_ADDRESS,
    subject: `Your free copy of "${bookTitle}" is ready`,
    text: [
      `Hi there,`,
      `Thanks for signing up! Here's your free copy of "${bookTitle}" by ${authorName}.`,
      `Download link: ${downloadUrl}`,
      `This link expires on ${expiryStr} and can be used up to 3 times.`,
      `— ${authorName}`,
    ].join("\n\n"),
    html: wrapHtml(`Your free copy of "${bookTitle}"`, `
      <p style="margin:0 0 16px;">Hi there,</p>
      <p style="margin:0 0 20px;">
        Thanks for signing up! Here&rsquo;s your free copy of
        <strong>${esc(bookTitle)}</strong> by ${esc(authorName)}.
      </p>
      ${coverImageUrl ? `
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:20px;">
          <img src="${coverImageUrl}" alt="${esc(bookTitle)}" style="max-width:160px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
        </td></tr>
      </table>` : ""}
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:4px 0 24px;">
            <a href="${downloadUrl}"
               style="display:inline-block;background:#059669;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Download Your Free Copy
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">If the button doesn&rsquo;t work, paste this link into your browser:</p>
      <p style="margin:0 0 20px;font-size:13px;word-break:break-all;"><a href="${downloadUrl}" style="color:#2563eb;">${downloadUrl}</a></p>
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        Link expires ${esc(expiryStr)} &middot; up to 3 downloads
      </p>
    `),
  });
}

// ── News issue email (to a platform News subscriber) ─────────────────────────

export function buildPlatformUnsubscribeLink(token: string): string {
  return `${baseUrl()}/api/newsletter/unsubscribe/platform?token=${token}`;
}

export function buildNewsIssueMailPayload(opts: {
  to: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string | null;
  unsubscribeToken: string;
}) {
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const postUrl       = `https://www.${platformDomain}/news/${opts.slug}`;
  const unsubscribeUrl = buildPlatformUnsubscribeLink(opts.unsubscribeToken);
  const blurb = opts.excerpt?.trim() || "Read the latest from AuthorLoft News.";

  const html = wrapHtml(opts.title, `
    ${opts.coverImageUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding-bottom:20px;">
        <img src="${opts.coverImageUrl}" alt="${esc(opts.title)}" style="max-width:100%;border-radius:8px;" />
      </td></tr>
    </table>` : ""}
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">${esc(blurb)}</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:4px 0 24px;">
          <a href="${postUrl}"
             style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
            Read it on AuthorLoft
          </a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <td align="center" style="padding:8px 0 0;">
          <a href="${unsubscribeUrl}" style="font-size:12px;color:#9ca3af;text-decoration:underline;">
            Unsubscribe from AuthorLoft News
          </a>
        </td>
      </tr>
    </table>
  `);

  const text = [
    opts.title,
    "",
    blurb,
    "",
    `Read it: ${postUrl}`,
    "",
    `---`,
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return {
    from:    BROADCAST_FROM_ADDRESS,
    to:      opts.to,
    subject: opts.title,
    html,
    text,
  };
}

export function buildBroadcastMailPayload(opts: {
  to: string;
  firstName: string;
  subject: string;
  body: string;
  unsubscribeToken?: string; // omit for personal 1:1 sends — no unsubscribe footer
  replyTo?: string;
}) {
  const unsubscribeUrl = opts.unsubscribeToken ? buildUnsubscribeLink(opts.unsubscribeToken) : undefined;
  // Case/whitespace-tolerant — {{firstName}}, {{FirstName}}, {{ FIRSTNAME }} all resolve
  const firstNameToken  = /\{\{\s*firstname\s*\}\}/gi;
  const resolvedSubject = opts.subject.replace(firstNameToken, opts.firstName);
  const resolvedBody    = opts.body.replace(firstNameToken, opts.firstName);
  const { html, text } = buildPlatformBroadcastEmail({
    firstName:      opts.firstName,
    subject:        resolvedSubject,
    body:           resolvedBody,
    unsubscribeUrl,
  });
  return {
    from:    BROADCAST_FROM_ADDRESS,
    to:      opts.to,
    subject: resolvedSubject,
    html,
    text,
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
  };
}
