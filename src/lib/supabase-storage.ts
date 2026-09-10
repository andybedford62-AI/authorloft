/**
 * Supabase Storage helper — server-side only.
 * Uses the Supabase Storage REST API directly (no @supabase/supabase-js needed).
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL      e.g. https://abcxyz.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY     your project's service-role (secret) key
 */

import { getRedisClient } from "./redis-client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  // Warn loudly at boot time rather than silently failing at upload time.
  console.warn(
    "[supabase-storage] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. " +
    "File uploads will fail until these are configured."
  );
}

/** Use for uploads whose path already embeds a timestamp/hash and is never reused. */
export const ONE_YEAR_CACHE = 31536000;

/**
 * Signed URL lifetime for customer-facing downloads (orders, ARC, reader-magnet,
 * course resources). The real access control is the app-level check on every
 * request (payment status, download count, link expiry) before a signed URL is
 * even minted — the token's own expiry isn't the security boundary, so a longer
 * TTL costs nothing there. It does let the signed-URL cache in this module stay
 * warm 24x longer than the old 1-hour value, meaningfully raising the CDN cache
 * hit rate for repeat/popular downloads.
 */
export const SIGNED_URL_TTL_DAY = 86400;

/**
 * Upload a Buffer to a Supabase Storage bucket.
 *
 * @param bucket             Bucket name, e.g. "book-covers"
 * @param path               Object path inside the bucket, e.g. "author-id/1234567890.jpg"
 * @param data               File contents as a Buffer
 * @param contentType        MIME type, e.g. "image/jpeg"
 * @param cacheControlSeconds Browser/CDN cache TTL in seconds (default 3600, Supabase's own
 *                           default). Pass a long value (e.g. ONE_YEAR_CACHE) for paths that
 *                           embed a timestamp/hash and are never overwritten at the same path —
 *                           overwriting a long-cached path (x-upsert) will serve stale content
 *                           until the cache expires.
 * @returns                  Public URL of the uploaded object
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  data: Buffer,
  contentType: string,
  cacheControlSeconds: number = 3600
): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true", // overwrite if path already exists
      "cache-control": `max-age=${cacheControlSeconds}`,
    },
    body: data as BodyInit,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase Storage upload failed (${res.status}): ${body}`);
  }

  // Return the public URL (bucket must be set to Public in Supabase dashboard)
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Generate a signed UPLOAD URL so the browser can upload a file directly to
 * Supabase Storage without going through the Next.js/Vercel function.
 * This bypasses Vercel's 4.5 MB body limit — essential for large book files.
 *
 * @param bucket  Bucket name, e.g. "book-files"
 * @param path    Object path inside the bucket
 * @returns       { signedUrl, path } — signedUrl is the URL the browser POSTs the file to
 */
export async function getSupabaseUploadUrl(
  bucket: string,
  path: string
): Promise<{ signedUrl: string; path: string }> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/upload/sign/${bucket}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}), // Supabase requires a body when Content-Type is application/json
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase signed upload URL failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  // Supabase returns { url: "/object/upload/sign/bucket/path?token=..." }
  // (field name varies by Supabase version — check all known variants)
  const signedPath: string = json.url ?? json.signedURL ?? json.signedUrl;
  if (!signedPath) {
    throw new Error(`Missing signedURL in response: ${JSON.stringify(json)}`);
  }

  // Supabase returns a relative path like "/object/upload/sign/..."
  // The full URL needs the /storage/v1 prefix added
  const signedUrl = signedPath.startsWith("http")
    ? signedPath
    : `${SUPABASE_URL}/storage/v1${signedPath}`;

  return { signedUrl, path };
}

// ── Signed URL cache ─────────────────────────────────────────────────────────
// Supabase's CDN caches a signed URL response keyed on the exact URL, token
// included. Minting a brand-new signed URL (a fresh token) on every download
// request therefore guarantees a cache miss every single time, even for
// repeat downloads of the same file — see
// https://supabase.com/docs/guides/storage/cdn/smart-cdn#signed-urls-and-cdn-caching
// Reusing the same signed URL until shortly before it expires lets the CDN
// actually serve repeat requests from cache instead of hitting the origin.
const SIGNED_URL_CACHE_SAFETY_MARGIN_S = 300; // stop reusing this long before the token expires
const signedUrlMemoryCache = new Map<string, { url: string; expiresAt: number }>();

function signedUrlCacheKey(bucket: string, path: string, expiresInSeconds: number, filename?: string): string {
  return `signed-url:${bucket}:${path}:${expiresInSeconds}:${filename ?? ""}`;
}

async function getCachedSignedUrl(key: string): Promise<string | null> {
  const client = await getRedisClient();
  if (client) {
    try {
      return await client.get(key);
    } catch {
      // fall through to memory cache below
    }
  }
  const hit = signedUrlMemoryCache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.url;
  signedUrlMemoryCache.delete(key);
  return null;
}

async function setCachedSignedUrl(key: string, url: string, ttlSeconds: number): Promise<void> {
  const client = await getRedisClient();
  if (client) {
    try {
      await client.set(key, url, { EX: ttlSeconds });
      return;
    } catch {
      // fall through to memory cache below
    }
  }
  signedUrlMemoryCache.set(key, { url, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/**
 * Generate a signed URL for a private Supabase Storage object, reusing a
 * cached one (Redis, falling back to in-memory) when available so repeat
 * downloads of the same file are CDN cache hits instead of fresh origin
 * fetches. Use this for delivering book files to paying customers — the
 * bucket must be private.
 *
 * @param bucket          Bucket name, e.g. "book-files"
 * @param path            Object path inside the bucket
 * @param expiresInSeconds How long the link is valid (default 3600 = 1 hour)
 * @param filename        Optional: sets Content-Disposition so browser downloads with this name
 * @returns               Signed URL string
 */
export async function getSupabaseSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds = 3600,
  filename?: string
): Promise<string> {
  const cacheable = expiresInSeconds > SIGNED_URL_CACHE_SAFETY_MARGIN_S;
  const cacheKey = signedUrlCacheKey(bucket, path, expiresInSeconds, filename);

  if (cacheable) {
    const cached = await getCachedSignedUrl(cacheKey);
    if (cached) return cached;
  }

  const url = await mintSupabaseSignedUrl(bucket, path, expiresInSeconds, filename);

  if (cacheable) {
    await setCachedSignedUrl(cacheKey, url, expiresInSeconds - SIGNED_URL_CACHE_SAFETY_MARGIN_S);
  }

  return url;
}

async function mintSupabaseSignedUrl(
  bucket: string,
  path: string,
  expiresInSeconds: number,
  filename?: string
): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Supabase Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const signUrl = `${SUPABASE_URL}/storage/v1/object/sign/${bucket}/${path}`;

  const body: Record<string, unknown> = { expiresIn: expiresInSeconds };
  if (filename) {
    // Ask Supabase to set Content-Disposition so the browser shows a save dialog
    body.transform = {};
    // Supabase doesn't support Content-Disposition transforms via sign API,
    // so we append it as a query param after getting the signed URL instead.
  }

  const res = await fetch(signUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn: expiresInSeconds }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Supabase sign URL failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  // Supabase returns { signedURL: "/object/sign/bucket/path?token=..." }
  // Check all known field name variants across Supabase versions
  const signedPath: string = json.signedURL ?? json.signedUrl ?? json.signed_url ?? json.url;
  if (!signedPath) {
    throw new Error(`Supabase signed URL response missing signedURL field: ${JSON.stringify(json)}`);
  }

  // Build absolute URL — Supabase returns a relative path so we must add /storage/v1
  let fullUrl = signedPath.startsWith("http")
    ? signedPath
    : `${SUPABASE_URL}/storage/v1${signedPath}`;

  // Append content-disposition so the browser downloads the file with a nice name
  if (filename) {
    const sep = fullUrl.includes("?") ? "&" : "?";
    fullUrl += `${sep}download=${encodeURIComponent(filename)}`;
  }

  return fullUrl;
}

/**
 * Delete an object from a Supabase Storage bucket.
 *
 * @param bucket  Bucket name
 * @param path    Object path inside the bucket
 */
export async function deleteFromSupabaseStorage(
  bucket: string,
  path: string
): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_KEY) return;

  const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;

  await fetch(deleteUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });
}
