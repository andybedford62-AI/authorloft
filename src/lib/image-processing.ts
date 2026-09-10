/**
 * Server-side image optimization for uploads — server-side only.
 *
 * Authors upload covers/hero images/etc. straight from their camera roll or a
 * designer with no resizing or compression, so the exact bytes they hand us
 * get stored and served forever. This downsizes oversized images and
 * re-encodes them as WebP before they ever reach Supabase Storage, which
 * shrinks every future transfer of that file — cached or not.
 */

import sharp from "sharp";

export interface OptimizeResult {
  buffer: Buffer;
  contentType: string;
  ext: string;
}

// Only raster formats sharp can safely re-encode. GIF is skipped because it
// may be animated (sharp's static re-encode would silently drop frames), and
// SVG is vector — resizing/rasterizing it would be a regression, not an
// optimization.
const OPTIMIZABLE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case "image/jpeg":
    case "image/jpg":  return "jpg";
    case "image/png":  return "png";
    case "image/webp": return "webp";
    case "image/gif":  return "gif";
    case "image/svg+xml": return "svg";
    case "image/avif": return "avif";
    default: return "bin";
  }
}

/**
 * Resize (never upscale) and re-encode an uploaded image.
 * Non-optimizable types (GIF, SVG, anything unrecognized) pass through untouched.
 *
 * @param buffer      Original file bytes
 * @param contentType Original MIME type, e.g. "image/jpeg"
 * @param opts.maxDimension   Longest side is capped to this many pixels (default 2000)
 * @param opts.quality        Encode quality 1-100 (default 82 — visually lossless for photos)
 * @param opts.lossless       Use lossless WebP instead (better for logos/screenshots with text/edges).
 *                            Ignored when convertFormat is false.
 * @param opts.convertFormat  Re-encode as WebP (default true). Pass false to keep the original
 *                            format (still resized + recompressed) — use this where a downstream
 *                            consumer needs a specific format, e.g. OG images for social-media
 *                            crawlers, or images forwarded to a third-party posting API.
 */
export async function optimizeImageForWeb(
  buffer: Buffer,
  contentType: string,
  opts: { maxDimension?: number; quality?: number; lossless?: boolean; convertFormat?: boolean } = {}
): Promise<OptimizeResult> {
  const normalizedType = contentType === "image/jpg" ? "image/jpeg" : contentType;

  if (!OPTIMIZABLE_TYPES.has(normalizedType)) {
    return { buffer, contentType, ext: extensionForContentType(contentType) };
  }

  const { maxDimension = 2000, quality = 82, lossless = false, convertFormat = true } = opts;

  try {
    let pipeline = sharp(buffer)
      .rotate() // auto-orient from EXIF before sharp strips it (sharp drops metadata by default)
      .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true });

    let outType = normalizedType;
    if (convertFormat) {
      pipeline = pipeline.webp({ quality, lossless });
      outType = "image/webp";
    } else if (normalizedType === "image/jpeg") {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (normalizedType === "image/png") {
      pipeline = pipeline.png({ compressionLevel: 9 });
    } else if (normalizedType === "image/webp") {
      pipeline = pipeline.webp({ quality, lossless });
    }

    const optimized = await pipeline.toBuffer();

    // Guard against regressions: an already-tiny/well-compressed source can
    // occasionally come back larger after a lossy re-encode. Keep whichever is smaller.
    if (optimized.length >= buffer.length) {
      return { buffer, contentType: normalizedType, ext: extensionForContentType(normalizedType) };
    }

    return { buffer: optimized, contentType: outType, ext: extensionForContentType(outType) };
  } catch (err) {
    console.warn("[image-processing] optimize failed, storing original:", err);
    return { buffer, contentType: normalizedType, ext: extensionForContentType(normalizedType) };
  }
}
