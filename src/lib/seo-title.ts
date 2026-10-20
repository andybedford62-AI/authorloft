// The root layout appends " | AuthorLoft" (13 chars) to every <title>. To land in the 30-60 character
// range as rendered, the page's own part has to be 17-47 characters.
const MAX_OWN = 47;
const MIN_OWN = 17;
const BRAND_SUFFIX = /\s*[|\-–—]\s*AuthorLoft(\s+Blog)?\s*$/i;

/**
 * Prepares a database-stored article title for the <title> tag: drops a brand suffix an editor already
 * typed (the template adds it again) and shortens a title that is too long, preferring a clean break at
 * a colon, question mark, dash or opening parenthesis over cutting mid-phrase. The on-page H1 and
 * og:title keep the full title.
 */
export function articleTitle(raw: string): string {
  const title = raw.replace(BRAND_SUFFIX, "").trim();
  if (title.length <= MAX_OWN) return title;

  const lead = title.split(/(?<=[:?])\s|\s[—–|-]\s|\s\(/)[0].replace(/[\s:,;–—-]+$/, "");
  if (lead.length >= MIN_OWN && lead.length <= MAX_OWN) return lead;

  const clipped = title.slice(0, MAX_OWN + 1);
  const cut = clipped.lastIndexOf(" ");
  return (cut >= MIN_OWN ? clipped.slice(0, cut) : title.slice(0, MAX_OWN)).replace(/[\s,:;&–—-]+$/, "");
}
