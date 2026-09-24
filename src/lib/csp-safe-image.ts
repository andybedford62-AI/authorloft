// CSP `img-src` (next.config.ts) allows only our own origin, Supabase storage
// and a few Google/Stripe hosts. Admin previews render whatever image URL an
// author pasted or an importer found — Amazon, Google Books (ISBN lookup),
// Goodreads, a site logo on some other domain — and a raw <img> pointing at
// any of those is silently blocked, leaving a broken-image icon.
//
// This routes those URLs through Next's image optimizer instead: /_next/image
// fetches them server-side (images.remotePatterns allows any https host) and
// serves the result from our own origin, which CSP permits. Same route
// next/image uses on the public site, so no CSP change is needed.
//
// Left untouched: data:/blob: (local file previews before upload), same-site
// paths, and Supabase storage (already allowed, and the optimizer would reject
// uploaded SVG logos).

const PASS_THROUGH = /^(data:|blob:|\/(?!\/))|^https:\/\/[^/]+\.supabase\.(co|in)\//i;

/** Widths the default Next optimizer accepts (deviceSizes + imageSizes). */
type OptimizerWidth = 64 | 96 | 128 | 256 | 384 | 640 | 750 | 828 | 1080 | 1200;

export function cspSafeImageSrc(url: string, width?: OptimizerWidth): string;
export function cspSafeImageSrc(url: string | null | undefined, width?: OptimizerWidth): string | undefined;
export function cspSafeImageSrc(url: string | null | undefined, width: OptimizerWidth = 640): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (PASS_THROUGH.test(trimmed) || !/^https?:\/\//i.test(trimmed)) return trimmed;
  return `/_next/image?url=${encodeURIComponent(trimmed)}&w=${width}&q=75`;
}
