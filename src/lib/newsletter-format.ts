// Shared formatting helpers for the author newsletter, used by both the send
// route (the real email) and the compose page (the preview) so the two can't
// drift apart.

/**
 * Plain text from a possibly-HTML field (e.g. a book's shortDescription, which
 * may contain <p> tags from a rich-text editor). Strips tags, decodes common
 * entities, and collapses whitespace to a single line. Without this, escaping
 * the raw value renders literal "<p>" text in the email.
 */
export function htmlToText(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Picks the right "tag" eyebrow + CTA label for the featured book, so the email
 * never says "Out now" for a pre-order, and never implies a purchase when the
 * author has no way to sell it.
 */
export function featuredBookTag(book: {
  isPreOrder: boolean;
  directSalesEnabled: boolean;
  externalBuyUrl: string | null;
}): { eyebrow: string; ctaLabel: string } {
  if (book.isPreOrder) return { eyebrow: "Coming soon", ctaLabel: "Pre-order" };
  const hasSeller = book.directSalesEnabled || !!book.externalBuyUrl;
  if (hasSeller) return { eyebrow: "Out now", ctaLabel: "Get the book" };
  return { eyebrow: "Featured", ctaLabel: "View the book" };
}
