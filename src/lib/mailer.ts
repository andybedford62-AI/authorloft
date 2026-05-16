/**
 * Email sender using Resend.
 * Requires: RESEND_API_KEY environment variable.
 *
 * If the var is absent the send call is a no-op so the app works
 * without email configured.
 */

import { Resend } from "resend";
import { prisma } from "./db";

const FROM_ADDRESS           = process.env.SMTP_FROM || "AuthorLoft <noreply@authorloft.com>";
const WELCOME_FROM_ADDRESS   = "AuthorLoft <welcome@authorloft.com>";
const BROADCAST_FROM_ADDRESS = "AuthorLoft <hello@authorloft.com>";

export function buildUnsubscribeLink(token: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
  return `${base}/api/unsubscribe/platform?token=${token}`;
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

Your free plan is a great start. Here's what unlocks on Standard ($39.99/mo):
• Sell books directly — Keep more revenue. No middlemen.
• Custom domain — Use your own authorname.com address.
• Unlimited books — No cap on your catalog.

And on Premium ($79.99/mo): full analytics so you can see exactly who's finding you and where they come from.

No pressure — upgrade whenever it makes sense.

Questions? Just reply to this email — we read every one.

— The AuthorLoft Team`;

function substituteVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
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
  body: string;
  unsubscribeUrl: string;
}): { html: string; text: string } {
  const escapedBody = opts.body
    .split("\n")
    .map(line => `<p style="margin:0 0 10px;font-size:14px;color:#374151;line-height:1.6;">${esc(line) || "&nbsp;"}</p>`)
    .join("\n");

  const html = wrapHtml(opts.subject, `
    ${escapedBody}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr>
        <td align="center" style="padding:8px 0 24px;">
          <a href="${opts.unsubscribeUrl}"
             style="font-size:12px;color:#9ca3af;text-decoration:underline;">
            Unsubscribe from AuthorLoft announcements
          </a>
        </td>
      </tr>
    </table>
  `);

  const text = opts.body + `\n\n---\nUnsubscribe: ${opts.unsubscribeUrl}`;

  return { html, text };
}

export function buildBroadcastMailPayload(opts: {
  to: string;
  firstName: string;
  subject: string;
  body: string;
  unsubscribeToken: string;
}) {
  const unsubscribeUrl = buildUnsubscribeLink(opts.unsubscribeToken);
  const resolvedBody   = opts.body.replace(/\{\{firstName\}\}/g, opts.firstName);
  const { html, text } = buildPlatformBroadcastEmail({
    firstName:      opts.firstName,
    subject:        opts.subject,
    body:           resolvedBody,
    unsubscribeUrl,
  });
  return {
    from:    BROADCAST_FROM_ADDRESS,
    to:      opts.to,
    subject: opts.subject,
    html,
    text,
  };
}
