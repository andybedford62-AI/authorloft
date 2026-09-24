// Checks that a cover address actually points at an image before it's saved.
// A product-page URL (e.g. amazon.com/dp/…) was once accepted as a cover and
// broke that book's cover everywhere (Sept 24 2026, 3 books).
//
// Only a definite answer blocks a save: a web page, or "not found". A timeout,
// a network error or a host that refuses bots is inconclusive and allowed, so a
// flaky third-party host never stops an author saving their book.

export type CoverCheck = { ok: true } | { ok: false; reason: string };

const TIMEOUT_MS = 6000;
const MAX_REDIRECTS = 3;

/** Our own storage — uploaded covers live here, no need to fetch them. */
function isOwnStorage(host: string): boolean {
  try {
    return host === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return false;
  }
}

/** Keeps the server from being pointed at itself or a private network. */
function isPrivateHost(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return true;
  if (h.includes(":")) return true; // IPv6 literal — no real cover host is addressed this way
  const m = h.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

const NOT_IMAGE =
  "That cover address is a web page, not an image. Open the cover, right-click it and choose \"Copy image address\", or upload the image instead.";

export async function checkCoverUrl(raw: unknown): Promise<CoverCheck> {
  if (typeof raw !== "string" || raw.trim() === "") return { ok: true };

  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, reason: "The cover address isn't a valid web address. It should start with https://" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: "The cover address should start with https://" };
  }
  if (isOwnStorage(url.hostname)) return { ok: true };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (isPrivateHost(url.hostname)) {
        return { ok: false, reason: "The cover address must be a public image link." };
      }
      // Redirects are followed by hand so each hop gets the private-host check.
      const res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { Accept: "image/*,*/*;q=0.8", "User-Agent": "Mozilla/5.0 (compatible; AuthorLoft cover check)" },
        cache: "no-store",
      });
      await res.body?.cancel().catch(() => {});

      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        url = new URL(location, url);
        continue;
      }
      if (res.status === 404 || res.status === 410) {
        return { ok: false, reason: "Nothing was found at that cover address (the link returns \"not found\")." };
      }
      if (!res.ok) return { ok: true }; // 403/429/5xx: inconclusive
      const type = (res.headers.get("content-type") ?? "").toLowerCase();
      if (type && !type.startsWith("image/") && !type.startsWith("application/octet-stream")) {
        return { ok: false, reason: NOT_IMAGE };
      }
      return { ok: true };
    }
    return { ok: true }; // too many redirects: inconclusive
  } catch {
    return { ok: true }; // timeout / network error: inconclusive
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Checks many covers (CSV import) with limited concurrency and an overall time
 * budget; anything not reached in time counts as inconclusive, i.e. allowed.
 * Returns the addresses that definitely aren't images.
 */
export async function findBadCoverUrls(urls: string[], concurrency = 8, budgetMs = 20000): Promise<Set<string>> {
  const bad = new Set<string>();
  const deadline = Date.now() + budgetMs;
  let next = 0;
  async function worker() {
    while (next < urls.length && Date.now() < deadline) {
      const u = urls[next++];
      if (!(await checkCoverUrl(u)).ok) bad.add(u);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return bad;
}
