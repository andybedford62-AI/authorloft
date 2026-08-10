import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { Resend } from "resend";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { resolveAccentColor } from "@/lib/themes";
import { sanitize } from "@/lib/sanitize";
import { htmlToText, featuredBookTag } from "@/lib/newsletter-format";

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

interface FeaturedBook {
  title: string;
  blurb: string | null;
  coverImageUrl: string | null;
  url: string;
  eyebrow: string;
  ctaLabel: string;
}

interface ShelfBook {
  title: string;
  coverImageUrl: string | null;
  url: string;
}

interface ReviewQuote {
  quote: string;
  attribution: string;
}

interface SpecialBlock {
  title: string;
  description: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
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
  featuredBook: FeaturedBook | null;
  shelf: ShelfBook[];
  review: ReviewQuote | null;
  special: SpecialBlock | null;
  socials: SocialLink[];
}) {
  const accent = opts.accentColor || "#2563eb";

  // Brand mark: logo > profile photo > initials circle.
  const brandMark = opts.logoUrl
    ? `<img src="${escapeHtml(opts.logoUrl)}" alt="${escapeHtml(opts.authorName)}" height="56" style="display:block;max-height:56px;width:auto;border:0;margin:0 auto;" />`
    : opts.profileImageUrl
      ? `<img src="${escapeHtml(opts.profileImageUrl)}" alt="${escapeHtml(opts.authorName)}" width="60" height="60" style="display:block;width:60px;height:60px;border-radius:50%;border:0;object-fit:cover;margin:0 auto;" />`
      : `<table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td width="60" height="60" align="center" valign="middle" style="width:60px;height:60px;border-radius:50%;background:#ffffff;color:${accent};font-size:22px;font-weight:700;">${escapeHtml(initialsOf(opts.authorName))}</td></tr></table>`;

  const taglineHtml = opts.tagline
    ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;">${escapeHtml(opts.tagline)}</p>`
    : "";

  // Featured book showcase — cover + blurb + CTA into the author site.
  const featuredHtml = opts.featuredBook
    ? `<tr><td style="padding:8px 40px 24px;">
        <table cellpadding="0" cellspacing="0" width="100%" style="background:#f7f4ed;border-radius:14px;"><tr>
          ${opts.featuredBook.coverImageUrl
            ? `<td width="120" valign="top" style="padding:24px 0 24px 24px;"><img src="${escapeHtml(opts.featuredBook.coverImageUrl)}" alt="${escapeHtml(opts.featuredBook.title)}" width="96" style="display:block;width:96px;border-radius:6px;border:0;" /></td>`
            : ""}
          <td valign="middle" style="padding:24px;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#9a8a66;">${escapeHtml(opts.featuredBook.eyebrow)}</p>
            <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1f2937;">${escapeHtml(opts.featuredBook.title)}</p>
            ${opts.featuredBook.blurb ? `<p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#5c6675;">${escapeHtml(opts.featuredBook.blurb)}</p>` : ""}
            <table cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:${accent};">
              <a href="${escapeHtml(opts.featuredBook.url)}" style="display:inline-block;padding:10px 22px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${escapeHtml(opts.featuredBook.ctaLabel)} &rarr;</a>
            </td></tr></table>
          </td>
        </tr></table>
      </td></tr>`
    : "";

  // Review pull-quote.
  const reviewHtml = opts.review
    ? `<tr><td style="padding:4px 40px 24px;">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td style="border-left:3px solid ${accent};padding:4px 0 4px 18px;">
            <p style="margin:0;font-style:italic;font-size:16px;line-height:1.5;color:#1f2937;">&ldquo;${escapeHtml(opts.review.quote)}&rdquo;</p>
            <p style="margin:8px 0 0;font-size:12px;color:#9097a3;">&mdash; ${escapeHtml(opts.review.attribution)}</p>
          </td>
        </tr></table>
      </td></tr>`
    : "";

  // "More on the shelf" strip — up to 3 other books.
  const shelfHtml = opts.shelf.length > 0
    ? `<tr><td style="padding:0 40px 28px;">
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#9097a3;">More on the shelf</p>
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          ${opts.shelf.map((b) => `<td width="33%" valign="top" align="center" style="padding:0 6px;">
            <a href="${escapeHtml(b.url)}" style="text-decoration:none;">
              ${b.coverImageUrl ? `<img src="${escapeHtml(b.coverImageUrl)}" alt="${escapeHtml(b.title)}" width="100" height="150" style="display:block;width:100px;height:150px;object-fit:cover;border-radius:5px;border:0;margin:0 auto 6px;" />` : ""}
              <span style="font-size:12px;color:#5c6675;">${escapeHtml(b.title)}</span>
            </a>
          </td>`).join("")}
        </tr></table>
      </td></tr>`
    : "";

  // Special / promo block — only when an active special exists.
  const specialHtml = opts.special
    ? `<tr><td style="background:${accent};padding:26px 40px;text-align:center;">
        <p style="margin:0 0 6px;font-size:17px;font-weight:700;color:#ffffff;">${escapeHtml(opts.special.title)}</p>
        ${opts.special.description ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.7);">${escapeHtml(opts.special.description)}</p>` : ""}
        ${opts.special.ctaUrl
          ? `<table cellpadding="0" cellspacing="0" align="center"><tr><td style="border-radius:999px;background:#ffffff;">
              <a href="${escapeHtml(opts.special.ctaUrl)}" style="display:inline-block;padding:11px 24px;font-size:13px;font-weight:600;color:${accent};text-decoration:none;border-radius:999px;">${escapeHtml(opts.special.ctaLabel || "Learn more")} &rarr;</a>
            </td></tr></table>`
          : ""}
      </td></tr>`
    : "";

  const socialHtml = opts.socials.length > 0
    ? `<p style="margin:0 0 12px;font-size:13px;">${opts.socials
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
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">A newsletter from ${escapeHtml(opts.authorName)}, an author you subscribed to on AuthorLoft.</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">

        <!-- Branded masthead -->
        <tr>
          <td style="background:${accent};padding:36px 40px 30px;text-align:center;">
            <a href="${escapeHtml(opts.siteUrl)}" style="text-decoration:none;">
              ${brandMark}
              <p style="margin:16px 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.65);">Author newsletter</p>
              <p style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">${escapeHtml(opts.authorName)}</p>
              ${taglineHtml}
            </a>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:30px 40px 8px;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;">${escapeHtml(opts.issueLabel)}</p>
            <div style="font-size:15px;line-height:1.75;color:#374151;">${opts.body}</div>
          </td>
        </tr>

        <!-- Primary CTA -->
        <tr>
          <td style="padding:18px 40px 24px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="border-radius:999px;background:${accent};">
                <a href="${escapeHtml(opts.siteUrl)}" style="display:inline-block;padding:12px 26px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">Read on my site &rarr;</a>
              </td>
            </tr></table>
          </td>
        </tr>

        ${featuredHtml}
        ${reviewHtml}
        ${shelfHtml}
        ${specialHtml}

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
            ${socialHtml}
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              You're receiving this because you subscribed to updates from
              <span style="color:#6b7280;font-weight:600;">${escapeHtml(opts.authorName)}</span>,
              an author you follow on AuthorLoft.
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
  const { subject, htmlBody, categoryFilter, includeBooks, includeReview, specialId } = body;

  if (!subject?.trim()) {
    return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  }
  if (!htmlBody?.trim() || htmlBody === "<p></p>") {
    return NextResponse.json({ error: "Email body cannot be empty." }, { status: 400 });
  }

  const safeHtmlBody = sanitize(htmlBody);

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

  const bookUrl = (slug: string) => `${siteUrl}/books/${slug}`;

  // Book showcase — featured (newest published) + up to 3 more on the shelf.
  let featuredBook: FeaturedBook | null = null;
  let shelf: ShelfBook[] = [];
  let featuredBookId: string | null = null;
  if (includeBooks) {
    const books = await prisma.book.findMany({
      where:   { authorId, isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take:    4,
      select:  {
        id: true, title: true, slug: true, coverImageUrl: true, shortDescription: true,
        isPreOrder: true, directSalesEnabled: true, externalBuyUrl: true,
      },
    });
    if (books.length > 0) {
      const [first, ...rest] = books;
      featuredBookId = first.id;
      const tag = featuredBookTag(first);
      featuredBook = {
        title:         first.title,
        blurb:         htmlToText(first.shortDescription),
        coverImageUrl: first.coverImageUrl,
        url:           bookUrl(first.slug),
        eyebrow:       tag.eyebrow,
        ctaLabel:      tag.ctaLabel,
      };
      shelf = rest.map((b) => ({ title: b.title, coverImageUrl: b.coverImageUrl, url: bookUrl(b.slug) }));
    }
  }

  // Review quote — prefer author-curated BookReview, fall back to an approved
  // reader BookFeedback. Scoped to the featured book when there is one.
  let review: ReviewQuote | null = null;
  if (includeReview) {
    const curated = await prisma.bookReview.findFirst({
      where:   featuredBookId ? { bookId: featuredBookId } : { book: { authorId } },
      orderBy: { sortOrder: "asc" },
      select:  { quote: true, reviewerName: true, source: true },
    });
    if (curated) {
      review = {
        quote:       curated.quote,
        attribution: [curated.reviewerName, curated.source].filter(Boolean).join(", "),
      };
    } else {
      const reader = await prisma.bookFeedback.findFirst({
        where:   featuredBookId
          ? { bookId: featuredBookId, status: "APPROVED" }
          : { book: { authorId }, status: "APPROVED" },
        orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
        select:  { comment: true, reviewerName: true, rating: true },
      });
      if (reader?.comment) {
        review = { quote: reader.comment, attribution: reader.reviewerName };
      }
    }
  }

  // Special / promo block — the author-chosen active special, if one is live.
  let special: SpecialBlock | null = null;
  if (specialId) {
    const now = new Date();
    const sp = await prisma.special.findFirst({
      where: {
        id: specialId, authorId, isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null },   { endsAt:   { gte: now } }] },
        ],
      },
      select: { title: true, description: true, ctaLabel: true, ctaUrl: true },
    });
    if (sp) {
      special = { title: sp.title, description: sp.description, ctaLabel: sp.ctaLabel, ctaUrl: sp.ctaUrl };
    }
  }

  // Campaign row is created up front (not after sending) so each batch's
  // CampaignSendLog rows have a campaignId to attach to as they go out.
  const campaign = await prisma.campaign.create({
    data: {
      authorId,
      subject: subject.trim(),
      totalSent:     0,
      totalFailed:   0,
      totalTargeted: subscribers.length,
      // Persisted so this send can be duplicated back into the composer
      // later instead of rebuilding a newsletter from scratch every time.
      body:           safeHtmlBody,
      categoryFilter: Array.isArray(categoryFilter) ? categoryFilter : [],
      includeBooks:   !!includeBooks,
      includeReview:  !!includeReview,
      specialId:      specialId || null,
    },
  });

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
          featuredBook,
          shelf,
          review,
          special,
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
        // result.data is { data: Array<{ id: string }> }, same order as `emails`
        const emailResults: any[] = (result.data as any)?.data ?? [];
        const successCount = emailResults.filter((r) => r?.id).length;
        sent   += successCount;
        failed += batch.length - successCount;

        // One CampaignSendLog row per successfully-sent recipient, keyed by
        // Resend's email id -- open/click webhook events reference this id
        // to find their way back to the right campaign + subscriber.
        const logRows = batch
          .map((sub, idx) => ({ sub, resendId: emailResults[idx]?.id as string | undefined }))
          .filter((r): r is { sub: typeof batch[number]; resendId: string } => !!r.resendId)
          .map((r) => ({
            campaignId:      campaign.id,
            subscriberEmail: r.sub.email,
            resendEmailId:   r.resendId,
          }));
        if (logRows.length > 0) {
          await prisma.campaignSendLog.createMany({ data: logRows, skipDuplicates: true })
            .catch((e) => console.error("[newsletter] Failed to write CampaignSendLog rows:", e));
        }
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

  // Finalize campaign counts now that every batch has been attempted
  await prisma.campaign.update({
    where: { id: campaign.id },
    data:  { totalSent: sent, totalFailed: failed },
  });

  return NextResponse.json({ sent, failed, total: subscribers.length });
}
