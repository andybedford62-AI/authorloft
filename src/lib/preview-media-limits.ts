// One definition of what a book preview slot accepts, shared by the upload
// routes and by the UI that tells the author. Kept in a lib on purpose: the
// limit the page advertises and the limit the server enforces drifting apart is
// how someone ends up staring at a rejection that contradicts the label.

export const PREVIEW_MEDIA_LIMITS: Record<string, number> = {
  "image/jpeg": 5 * 1024 * 1024,
  "image/png": 5 * 1024 * 1024,
  "image/webp": 5 * 1024 * 1024,
  "image/gif": 5 * 1024 * 1024,
  "video/mp4": 50 * 1024 * 1024,
  "video/quicktime": 50 * 1024 * 1024, // .mov — what phones actually produce
  "audio/mpeg": 20 * 1024 * 1024,
  "audio/mp3": 20 * 1024 * 1024,
};

/** Extensions accepted, derived from the mime map so the two can't disagree. */
export const PREVIEW_MEDIA_EXTENSIONS = [
  "jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "mp3",
] as const;

export const MAX_PREVIEW_BYTES = Math.max(...Object.values(PREVIEW_MEDIA_LIMITS));

export function limitForMime(mime: string): number | null {
  return PREVIEW_MEDIA_LIMITS[mime] ?? null;
}

export function formatMb(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

/** Human summary for the upload UI — the text the author actually reads. */
export const PREVIEW_LIMIT_SUMMARY =
  "Images (JPG, PNG, WebP, GIF) up to 5 MB · Video (MP4, MOV) up to 50 MB · Audio (MP3) up to 20 MB";

/** Message shown when a chosen file is rejected before any upload starts. */
export function tooLargeMessage(file: File, limit: number): string {
  return `"${file.name}" is ${formatMb(file.size)}. The limit for this file type is ${formatMb(limit)}.`;
}

export function unsupportedTypeMessage(file: File): string {
  const ext = file.name.split(".").pop()?.toUpperCase() ?? "that";
  return `${ext} files aren't supported here. ${PREVIEW_LIMIT_SUMMARY}.`;
}
