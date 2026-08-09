// IndexNow — instantly notify Bing/Yandex when content is published or changed.
// Key file lives at https://www.{domain}/{KEY}.txt (in /public). One ping covers
// all IndexNow-participating search engines. Fire-and-forget; never throws.

const KEY = "492fc0b1e1d527c567fac588e9787796";
const DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com";
const HOST = `www.${DOMAIN}`;
const BASE = `https://${HOST}`;

/**
 * Notify IndexNow about one or more changed pages.
 * @param paths Absolute URLs or root-relative paths (e.g. "/news/my-post").
 */
export async function pingIndexNow(paths: string[]): Promise<void> {
  // Only ping from production — the key file is served from the prod host.
  if (process.env.VERCEL_ENV !== "production") return;

  const urlList = Array.from(
    new Set(
      paths
        .filter(Boolean)
        .map((p) => (p.startsWith("http") ? p : `${BASE}${p.startsWith("/") ? "" : "/"}${p}`))
    )
  );
  if (urlList.length === 0) return;

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `${BASE}/${KEY}.txt`,
        urlList,
      }),
    });
  } catch (err) {
    console.error("[indexnow] ping failed:", err);
  }
}
