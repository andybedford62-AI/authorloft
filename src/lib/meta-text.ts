/**
 * Turn stored rich text into clean plain text for <meta name="description">,
 * og:description and JSON-LD.
 *
 * Author bios, series blurbs and book descriptions are saved as HTML by the
 * rich-text editor ("<p>Hello &amp; welcome</p>"). Dropping that straight into a
 * meta tag makes Google and Bing show literal tags in the snippet, and an empty
 * bio becomes the description "<p></p>".
 */

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“",
  ndash: "–", mdash: "—", hellip: "…",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : match;
    }
    return NAMED[e.toLowerCase()] ?? match;
  });
}

/** HTML (possibly entity-encoded) to single-line plain text. */
export function plainText(html: string | null | undefined): string {
  if (!html) return "";
  let t = decodeEntities(html); // handles "&lt;p&gt;" stored as escaped text
  t = t.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  t = t.replace(/<\/(p|div|li|h[1-6]|blockquote)>|<br\s*\/?>/gi, " "); // block ends become spaces
  t = t.replace(/<[^>]*>/g, ""); // remaining (inline) tags vanish so "<b>wo</b>rd" stays "word"
  t = decodeEntities(t);
  return t.replace(/\s+/g, " ").trim();
}

/**
 * Clean, length-capped description. `input` may be a list of candidates; the first
 * one with real text wins. Falls back to `fallback` when nothing is left.
 * Cuts on a word boundary and adds an ellipsis when it has to shorten.
 */
export function toMetaDescription(
  input: string | null | undefined | (string | null | undefined)[],
  fallback = "",
  max = 160,
): string {
  const candidates = Array.isArray(input) ? input : [input];
  for (const c of candidates) {
    const t = plainText(c);
    if (!t) continue;
    if (t.length <= max) return t;
    const cut = t.slice(0, max - 1);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, "")}…`;
  }
  return fallback;
}
