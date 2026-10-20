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

const DESC_MIN = 110;
const DESC_MAX = 160;

function clampDescription(text: string): string {
  if (text.length <= DESC_MAX) return text;
  const head = text.slice(0, DESC_MAX + 1);
  // Prefer ending on a full sentence, then on a word, so the snippet never stops mid-word.
  const sentence = Math.max(head.lastIndexOf(". "), head.lastIndexOf("? "), head.lastIndexOf("! "));
  if (sentence >= DESC_MIN - 1) return head.slice(0, sentence + 1);
  const word = head.lastIndexOf(" ");
  return head.slice(0, word > DESC_MIN ? word : DESC_MAX).replace(/[\s,:;–—-]+$/, "");
}

/**
 * Picks the meta description for a database-stored article: the editor's description if it is 110-160
 * characters, otherwise the excerpt, otherwise the opening of the article body. Anything too long is cut at
 * a sentence or word break. A description that is only too short is used as written when nothing longer exists.
 */
export function articleDescription(
  meta: string | null | undefined,
  excerpt: string | null | undefined,
  contentHtml: string | null | undefined,
): string | undefined {
  const body = (contentHtml ?? "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const candidates = [meta, excerpt, body]
    .map((c) => (c ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (candidates.length === 0) return undefined;

  for (const c of candidates) {
    if (c.length >= DESC_MIN && c.length <= DESC_MAX) return c;
  }
  const long = candidates.find((c) => c.length > DESC_MAX);
  if (long) return clampDescription(long);
  return candidates[0];
}
