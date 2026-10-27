// Newsletter sending, shared by the send route, the scheduled-send cron and the
// test-email route so all three ship the same HTML.
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { resolveAccentColor } from "@/lib/themes";
import { sanitize } from "@/lib/sanitize";
import { htmlToText, featuredBookTag } from "@/lib/newsletter-format";
import {
  buildEmailHtml, htmlToPlainText,
  type FeaturedBook, type ShelfBook, type ReviewQuote, type SpecialBlock, type SocialLink,
} from "@/lib/newsletter-email";

const BATCH_SIZE = 50;

export interface NewsletterConfig {
  subject:        string;
  htmlBody:       string;
  categoryFilter: string[];
  includeBooks:   boolean;
  includeReview:  boolean;
  specialId:      string | null;
}

export type SendOutcome =
  | { ok: true; sent: number; failed: number; total: number; campaignId: string }
  | { ok: false; error: string; status: number };

// Everything the email needs besides the recipient: author branding, URLs, and
// the optional book / review / special blocks.
async function loadEmailContext(authorId: string, cfg: NewsletterConfig) {
  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: {
      id: true, name: true, displayName: true, slug: true, contactEmail: true, email: true,
      tagline: true, logoUrl: true, profileImageUrl: true,
      siteTheme: true, customAccentColor: true,
      linkedinUrl: true, youtubeUrl: true, facebookUrl: true, twitterUrl: true, instagramUrl: true,
      plan: { select: { tier: true } },
    },
  });
  if (!author) return null;

  const authorName     = author.displayName || author.name;
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const siteUrl        = `https://${author.slug}.${platformDomain}`;
  const baseUrl        = process.env.NEXTAUTH_URL ?? "https://www.authorloft.com";
  const fromAddress    = `${authorName} via AuthorLoft <noreply@authorloft.com>`;
  const replyTo        = author.contactEmail ?? undefined;

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
  if (cfg.includeBooks) {
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
  if (cfg.includeReview) {
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
  if (cfg.specialId) {
    const now = new Date();
    const sp = await prisma.special.findFirst({
      where: {
        id: cfg.specialId, authorId, isActive: true,
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

  const renderFor = (subject: string, safeBody: string, unsubscribeUrl: string) =>
    buildEmailHtml({
      authorName,
      tagline:         author.tagline,
      logoUrl:         author.logoUrl,
      profileImageUrl: author.profileImageUrl,
      accentColor,
      subject,
      body:            safeBody,
      issueLabel,
      unsubscribeUrl,
      siteUrl,
      featuredBook,
      shelf,
      review,
      special,
      socials,
    });

  return { author, baseUrl, fromAddress, replyTo, renderFor };
}

/**
 * Sends a newsletter to the author's confirmed subscribers. With `campaignId`
 * (scheduled sends) the existing Campaign row is reused; otherwise one is
 * created up front so each batch's CampaignSendLog rows have something to
 * attach to.
 */
export async function sendNewsletter(
  authorId: string,
  cfg: NewsletterConfig,
  opts: { campaignId?: string } = {},
): Promise<SendOutcome> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "Email service is not configured.", status: 503 };
  }

  const safeHtmlBody = sanitize(cfg.htmlBody);

  const ctx = await loadEmailContext(authorId, cfg);
  if (!ctx) return { ok: false, error: "Author not found.", status: 404 };

  const subscriberWhere: Record<string, unknown> = { authorId, isConfirmed: true };
  if (cfg.categoryFilter.length > 0) {
    subscriberWhere.OR = [
      { categoryPrefs: { isEmpty: true } },
      { categoryPrefs: { hasSome: cfg.categoryFilter } },
    ];
  }

  const subscribers = await prisma.subscriber.findMany({
    where:  subscriberWhere,
    select: { email: true, name: true, unsubscribeToken: true },
  });
  if (subscribers.length === 0) {
    return { ok: false, error: "No confirmed subscribers to send to.", status: 400 };
  }

  const subject = cfg.subject.trim();

  const campaignId = opts.campaignId
    ? (await prisma.campaign.update({
        where:  { id: opts.campaignId },
        data:   { totalTargeted: subscribers.length },
        select: { id: true },
      })).id
    : (await prisma.campaign.create({
        data: {
          authorId,
          subject,
          totalSent:     0,
          totalFailed:   0,
          totalTargeted: subscribers.length,
          // Persisted so this send can be duplicated back into the composer later.
          body:           safeHtmlBody,
          categoryFilter: cfg.categoryFilter,
          includeBooks:   cfg.includeBooks,
          includeReview:  cfg.includeReview,
          specialId:      cfg.specialId,
        },
        select: { id: true },
      })).id;

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent   = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);

    const emails = batch.map((sub) => {
      const unsubscribeUrl = `${ctx.baseUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribeToken}`;
      return {
        from:    ctx.fromAddress,
        to:      sub.email,
        subject,
        replyTo: ctx.replyTo,
        html:    ctx.renderFor(subject, safeHtmlBody, unsubscribeUrl),
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
        // Resend's email id -- open/click webhooks reference this id.
        const logRows = batch
          .map((sub, idx) => ({ sub, resendId: emailResults[idx]?.id as string | undefined }))
          .filter((r): r is { sub: typeof batch[number]; resendId: string } => !!r.resendId)
          .map((r) => ({
            campaignId,
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

  await prisma.campaign.update({
    where: { id: campaignId },
    data:  { totalSent: sent, totalFailed: failed, status: "SENT", sentAt: new Date() },
  });

  return { ok: true, sent, failed, total: subscribers.length, campaignId };
}

/** One "[TEST]" copy to the author's own login email. No Campaign row, no send logs. */
export async function sendTestNewsletter(
  authorId: string,
  cfg: NewsletterConfig,
): Promise<{ ok: true; to: string } | { ok: false; error: string; status: number }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: "Email service is not configured.", status: 503 };
  }
  const ctx = await loadEmailContext(authorId, cfg);
  if (!ctx) return { ok: false, error: "Author not found.", status: 404 };

  const safeHtmlBody   = sanitize(cfg.htmlBody);
  const subject        = `[TEST] ${cfg.subject.trim()}`;
  const unsubscribeUrl = `${ctx.baseUrl}/api/newsletter/unsubscribe?token=test-email-preview`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from:    ctx.fromAddress,
    to:      ctx.author.email,
    subject,
    replyTo: ctx.replyTo,
    html:    ctx.renderFor(subject, safeHtmlBody, unsubscribeUrl),
    text:    htmlToPlainText(safeHtmlBody) + "\n\n---\nThis is a test send; the unsubscribe link is inactive.",
  });
  if (error) {
    console.error("[newsletter] Test send failed:", error);
    return { ok: false, error: "Could not send the test email. Please try again.", status: 502 };
  }
  return { ok: true, to: ctx.author.email };
}
