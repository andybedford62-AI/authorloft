import { slugify } from "@/lib/utils";

// Shared by the public music pages, the share bar and the admin share kit, so
// the release label, the track deep-link key and the tagged share URLs are
// built one way everywhere.

export type MusicReleaseType = "PLAYLIST" | "ALBUM" | "EP" | "SINGLE";

export const RELEASE_TYPES: { value: MusicReleaseType; label: string }[] = [
  { value: "PLAYLIST", label: "Playlist" },
  { value: "ALBUM", label: "Album" },
  { value: "EP", label: "EP" },
  { value: "SINGLE", label: "Single" },
];

/** Null (older rows, never set) reads as a Playlist. */
export function releaseLabel(type: string | null | undefined): string {
  return RELEASE_TYPES.find((t) => t.value === type)?.label ?? "Playlist";
}

export function isReleaseType(v: unknown): v is MusicReleaseType {
  return typeof v === "string" && RELEASE_TYPES.some((t) => t.value === v);
}

/**
 * The `?track=` value for each track. Title slugs, not lesson ids: the editor
 * replaces every lesson row on save, so ids change constantly, while a title
 * survives edits and reorders. A title that repeats (or slugs to nothing)
 * falls back to its 1-based position.
 */
export function trackKeys(titles: string[]): string[] {
  const slugs = titles.map((t) => slugify(t));
  return slugs.map((s, i) =>
    s && slugs.indexOf(s) === slugs.lastIndexOf(s) ? s : String(i + 1)
  );
}

/** Resolves a `?track=` value to an index, accepting a key or a bare position. */
export function findTrackIndex(keys: string[], wanted: string | undefined): number {
  if (!wanted) return -1;
  const byKey = keys.indexOf(wanted);
  if (byKey !== -1) return byKey;
  const n = Number(wanted);
  return Number.isInteger(n) && n >= 1 && n <= keys.length ? n - 1 : -1;
}

/** Adds UTM tags so PostHog attributes the visit to the network it came from. */
export function taggedUrl(url: string, source: string, campaign: string, medium = "social"): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", source);
    u.searchParams.set("utm_medium", medium);
    u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    return url;
  }
}

export type ShareNetwork = "facebook" | "x" | "threads" | "whatsapp" | "reddit" | "linkedin" | "email";

/** Web share-intent URLs. TikTok and Instagram have none — they're reached
 *  through the device share sheet or a copied link. */
export function shareIntentUrl(network: ShareNetwork, url: string, text: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (network) {
    case "facebook": return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "x":        return `https://x.com/intent/post?text=${t}&url=${u}`;
    case "threads":  return `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text} ${url}`)}`;
    case "whatsapp": return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    case "reddit":   return `https://www.reddit.com/submit?url=${u}&title=${t}`;
    case "linkedin": return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "email":    return `mailto:?subject=${t}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
  }
}
