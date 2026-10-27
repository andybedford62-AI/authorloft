// Newsletter email HTML rendering (pure, no I/O). Used by newsletter-send.ts.

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export interface FeaturedBook {
  title: string;
  blurb: string | null;
  coverImageUrl: string | null;
  url: string;
  eyebrow: string;
  ctaLabel: string;
}

export interface ShelfBook {
  title: string;
  coverImageUrl: string | null;
  url: string;
}

export interface ReviewQuote {
  quote: string;
  attribution: string;
}

export interface SpecialBlock {
  title: string;
  description: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

export interface SocialLink {
  label: string;
  url: string;
}

export function buildEmailHtml(opts: {
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

export function htmlToPlainText(html: string): string {
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
