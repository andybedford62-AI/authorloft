import sanitizeHtml from "sanitize-html";

/**
 * HeyCatch blog API client. Articles are read live (never copied into the DB)
 * and served under /blog/guides. Server-only: the key stays in env.
 */

const API_BASE = process.env.HEYCATCH_API_BASE || "https://api.heycatch.ai/v1";
export const HEYCATCH_REVALIDATE = 120;

export type HeyCatchListItem = {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  published: string | null;
  updated: string | null;
  published_at: string | null;
  updated_at: string | null;
  read_time: number | null;
  keywords: string[] | null;
  featured_image: string | null;
  language: string | null;
  hero_image_url: string | null;
};

export type HeyCatchArticle = HeyCatchListItem & {
  content_html: string;
  jsonLd?: Record<string, unknown> | null;
};

async function hcFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<{ status: number; data: T | null }> {
  const key = process.env.HEYCATCH_API_KEY;
  if (!key) return { status: 0, data: null };

  const qs = new URLSearchParams({ key, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const url = `${API_BASE}${path}?${qs.toString()}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate: HEYCATCH_REVALIDATE },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 429 && attempt === 0) {
        const wait = Math.min(Number(res.headers.get("Retry-After")) || 1, 3);
        await new Promise((r) => setTimeout(r, wait * 1000));
        continue;
      }
      if (!res.ok) return { status: res.status, data: null };
      return { status: res.status, data: (await res.json()) as T };
    } catch {
      return { status: 0, data: null };
    }
  }
  return { status: 429, data: null };
}

/** Every article, newest first (pages through the API 50 at a time). */
export async function listHeyCatchArticles(): Promise<HeyCatchListItem[]> {
  const all: HeyCatchListItem[] = [];
  let offset = 0;
  for (let guard = 0; guard < 40; guard++) {
    const { data } = await hcFetch<{ articles: HeyCatchListItem[]; total: number }>("/articles", { limit: 50, offset });
    if (!data?.articles?.length) break;
    all.push(...data.articles);
    offset += 50;
    if (offset >= data.total) break;
  }
  return all;
}

/** True when at least one article exists (cheap: limit=1). */
export async function hasHeyCatchArticles(): Promise<boolean> {
  const { data } = await hcFetch<{ total: number }>("/articles", { limit: 1 });
  return (data?.total ?? 0) > 0;
}

/** `null` = not found; `undefined` = API error (render empty state, not 404). */
export async function getHeyCatchArticle(slug: string): Promise<HeyCatchArticle | null | undefined> {
  const { status, data } = await hcFetch<{ article: HeyCatchArticle }>(`/articles/${encodeURIComponent(slug)}`);
  if (data?.article) return data.article;
  return status === 404 ? null : undefined;
}

/** Sanitize article HTML: keep structure and `id` on h2 only; drop scripts, styles, iframes, handlers. */
export function sanitizeHeyCatchHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr", "ul", "ol", "li", "blockquote",
      "strong", "b", "em", "i", "code", "pre", "a",
      "table", "thead", "tbody", "tr", "th", "td", "details", "summary",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      h2: ["id"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          ...(attribs.href?.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" }),
        },
      }),
    },
  });
}

export type TocItem = { id: string; text: string };

const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();

/**
 * Splits sanitized HTML around the table of contents: TOC goes after the
 * Key takeaways list, or above everything when there is none. Headings and
 * their ids are read, never changed. FAQ is left out of the TOC.
 */
export function splitForToc(html: string): { before: string; after: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const re = /<h2\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const text = stripTags(m[2]);
    if (/^(key takeaways?|faq|frequently asked questions)\b/i.test(text)) continue;
    toc.push({ id: m[1], text });
  }

  const firstH2 = html.search(/<h2\b/i);
  const firstText = firstH2 >= 0 ? stripTags((html.slice(firstH2).match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i) ?? [])[1] ?? "") : "";
  if (firstH2 === 0 && /^key takeaways?/i.test(firstText)) {
    const afterFirst = html.slice(firstH2 + 3).search(/<h2\b/i);
    if (afterFirst >= 0) {
      const cut = firstH2 + 3 + afterFirst;
      return { before: html.slice(0, cut), after: html.slice(cut), toc };
    }
    return { before: html, after: "", toc };
  }
  return { before: "", after: html, toc };
}

export const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);
