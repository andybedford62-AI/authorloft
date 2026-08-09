/**
 * Strip HTML tags and collapse whitespace to produce a plain-text snippet
 * suitable for a meta description (capped at 160 chars on a word boundary).
 */
export function autoMetaDescription(
  html: string | null | undefined,
): string | null {
  if (!html) return null;

  const plain = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return null;
  if (plain.length <= 160) return plain;

  const truncated = plain.slice(0, 160);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated) + "...";
}
