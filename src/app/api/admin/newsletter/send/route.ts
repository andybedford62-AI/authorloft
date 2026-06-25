import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { Resend } from "resend";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { resolveAccentColor } from "@/lib/themes";
import sanitizeHtml from "sanitize-html";

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

const NEWSLETTER_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s",
    "h1", "h2", "h3", "h4",
    "ul", "ol", "li",
    "a", "blockquote", "hr", "span", "div",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    span: ["style"],
    p: ["style"],
    div: ["style"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, rel: "noopener noreferrer" },
    }),
  },
};

interface LatestBook {
  title: string;
  coverImageUrl: string | null;
  url: string;
}

interface SocialLink {
  label: string;
  url: string;
}

function buildEmailHtml(opts: {
  authorName: string;
  tagline: string | null;
  logoUrl: string | null;
  profileImageUrl: string | null;
  accentColor: string;
  subject: string;
  body: string;
  issueLabel: string;
  unsubscribeUrl: string;
  siteUrl: string;
  latestBook: LatestBook | null;
  socials: SocialLink[];
}) {
  const accent = opts.accentColor || "#2563eb";

  // Brand mark: logo > profile photo > initials circle.
  const brandMark = opts.logoUrl
    ? `<img src="${escapeHtml(opts.logoUrl)}" alt="${escapeHtml(opts.authorName)}" height="52" style="display:block;max-height:52px;width:auto;border:0;" />`
    : opts.profileImageUrl
      ? `<img src="${escapeHtml(opts.profileImageUrl)}" alt="${escapeHtml(opts.authorName)}" width="52" height="52" style="display:block;width:52px;height:52px;border-radius:50%;border:0;object-fit:cover;" />`
      : `<table cellpadding="0" cellspacing="0"><tr><td width="52" height="52" align="center" valign="middle" style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.18);color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(initialsOf(opts.authorName))}</td></tr></table>`;

  const taglineHtml = opts.tagline
    ? `<p style="margin:3px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">${escapeHtml(opts.tagline)}</p>`
    : "";

  const bookStrip = opts.latestBook
    ? `<tr>
          <td style="background:#faf8f3;border-top:1px solid #ece7dc;padding:18px 36px;">
            <table cellpadding="0" cellspacing="0" width="100%"><tr>
              ${opts.latestBook.coverImageUrl
                ? `<td width="56" valign="top" style="padding-right:16px;"><img src="${escapeHtml(opts.latestBook.coverImageUrl)}" alt="${escapeHtml(opts.latestBook.title)}" width="56" style="display:block;width:56px;border-radius:4px;border:0;" /></td>`
                : ""}
              <td valign="middle">
                <p style="margin:0;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9a8a66;">Latest release</p>
                <p style="margin:2px 0 0;font-size:15px;font-weight:600;color:#1f2937;">${escapeHtml(opts.latestBook.title)}</p>
                <a href="${escapeHtml(opts.latestBook.url)}" style="font-size:13px;color:${accent};text-decoration:none;">View book &rarr;</a>
              </td>
            </tr></table>
          </td>
        </tr>`
    : "";

  const socialHtml = opts.socials.length > 0
    ? `<p style="margin:0 0 10px;font-size:13px;">${opts.socials
        .map((s) => `<a href="${escapeHtml(s.url)}" style="color:#6b7280;text-decoration:none;">${escapeHtml(s.label)}</a>`)
        .join('<span style="color:#d1d5db;"> &nbsp;·&nbsp; </span>')}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(opts.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">

        <!-- Branded header -->
        <tr>
          <td style="background:${accent};padding:26px 36px;">
            <table cellpadding="0" cellspacing="0" width="100%"><tr>
              <td width="52" valign="middle" style="padding-right:16px;">${brandMark}</td>
              <td valign="middle">
                <a href="${escapeHtml(opts.siteUrl)}" style="text-decoration:none;">
                  <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(opts.authorName)}</p>
                  ${taglineHtml}
                </a>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px 36px 8px;">
            <p style="margin:0 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;">${escapeHtml(opts.issueLabel)}</p>
            <div style="font-size:15px;line-height:1.7;color:#374151;">${opts.body}</div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:8px 36px 30px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="border-radius:999px;background:${accent};">
                <a href="${escapeHtml(opts.siteUrl)}" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">Read on my site &rarr;</a>
              </td>
            </tr></table>
          </td>
        </tr>

        ${bookStrip}

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:22px 36px;text-align:center;">
            ${socialHtml}
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              You're receiving this because you subscribed to ${escapeHtml(opts.authorName)}.
            </p>
            <p style="margin:8px 0 0;font-size:12px;">
              <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(opts.siteUrl)}" style="color:#6b7280;text-decoration:underline;">Visit site</a>
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
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const newsletterCheck = await canUseFeature(authorId, "newsletter");
  if (!newsletterCheck.allowed) {
    return NextResponse.json({ error: newsletterCheck.reason }, { status: 403 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  const body = await req.json();
  const { subject, htmlBody, categoryFilter, includeLatestBook } = body;

  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!htmlBody?.trim() || htmlBody === "<p></p>") {
    return NextResponse.json({ error: "Email body cannot be empty." }, { status: 400 });
  }

  const safeHtmlBody = sanitizeHtml(htmlBody, NEWSLETTER_SANITIZE_OPTIONS);

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: {
      id: true, name: true, displayName: true, slug: true, contactEmail: true,
      tagline: true, logoUrl: true, profileImageUrl: true,
      siteTheme: true, customAccentColor: true,
      linkedinUrl: true, youtubeUrl: true, facebookUrl: true, twitterUrl: true, instagramUrl: true,
      plan: { select: { tier: true } },
    },
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

  const accentColor = resolveAccentColor({
    planTier:          author.plan?.tier,
    customAccentColor: author.customAccentColor,
    siteTheme:         author.siteTheme,
  });

  const issueLabel = `Newsletter · ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

  const socials: SocialLink[] = [
    { label: "Instagram", url: author.instagramUrl },
    { label: "Facebook",  url: author.facebookUrl  },
    { label: "X",         url: author.twitterUrl   },
    { label: "YouTube",   url: author.youtubeUrl   },
    { label: "LinkedIn",  url: author.linkedinUrl  },
  ].filter((s): s is SocialLink => !!s.url);

  // Optional latest-release strip — newest published book, if the author opted in.
  let latestBook: LatestBook | null = null;
  if (includeLatestBook) {
    const book = await prisma.book.findFirst({
      where:   { authorId, isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select:  { title: true, slug: true, coverImageUrl: true },
    });
    if (book) {
      latestBook = { title: book.title, coverImageUrl: book.coverImageUrl, url: `${siteUrl}/books/${book.slug}` };
    }
  }

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
        html:    buildEmailHtml({
          authorName,
          tagline:         author.tagline,
          logoUrl:         author.logoUrl,
          profileImageUrl: author.profileImageUrl,
          accentColor,
          subject,
          body:            safeHtmlBody,
          issueLabel,
          unsubscribeUrl,
          siteUrl,
          latestBook,
          socials,
        }),
        text:    htmlToPlainText(safeHtmlBody) + `\n\n---\nUnsubscribe: ${unsubscribeUrl}`,
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
