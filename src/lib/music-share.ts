import { slugify } from "@/lib/utils";

// Shared by the public music pages and the admin editor, so the release label
// and the track deep-link key are built one way everywhere.

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

// Share links are shared with books and courses; re-exported so music callers
// keep one import.
export { taggedUrl, shareIntentUrl, type ShareNetwork } from "@/lib/share";

// ── Album-level "Listen on" links ────────────────────────────────────────────

export const MAX_LISTEN_LINKS = 8;

const LISTEN_PLATFORMS: { hosts: string[]; label: string }[] = [
  { hosts: ["open.spotify.com", "spotify.com", "spotify.link"], label: "Spotify" },
  { hosts: ["music.apple.com", "itunes.apple.com"], label: "Apple Music" },
  { hosts: ["music.youtube.com"], label: "YouTube Music" },
  { hosts: ["youtube.com", "youtu.be"], label: "YouTube" },
  { hosts: ["bandcamp.com"], label: "Bandcamp" },
  { hosts: ["soundcloud.com", "on.soundcloud.com"], label: "SoundCloud" },
  { hosts: ["music.amazon.com", "amazon.com"], label: "Amazon Music" },
  { hosts: ["tidal.com", "listen.tidal.com"], label: "Tidal" },
  { hosts: ["deezer.com", "deezer.page.link"], label: "Deezer" },
  { hosts: ["suno.com", "suno.ai"], label: "Suno" },
];

/** Platform name for a "Listen on" link; unknown hosts show their domain. */
export function listenPlatform(url: string): string {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "Link";
  }
  // Bandcamp artists live on <artist>.bandcamp.com, hence the suffix match.
  const hit = LISTEN_PLATFORMS.find((p) => p.hosts.some((h) => host === h || host.endsWith(`.${h}`)));
  return hit?.label ?? host;
}

/** Normalises whatever came in (API body or the Json column) to a clean list of
 *  unique https URLs, capped. Anything else is dropped rather than rejected. */
export function parseListenLinks(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const v of input) {
    if (typeof v !== "string") continue;
    try {
      const u = new URL(v.trim());
      if (u.protocol !== "https:") continue;
      const s = u.toString();
      if (!out.includes(s)) out.push(s);
    } catch {
      /* not a URL */
    }
    if (out.length >= MAX_LISTEN_LINKS) break;
  }
  return out;
}

/** `YYYY-MM-DD` from the date input → a Date for the @db.Date column; "" clears. */
export function parseReleaseDate(input: unknown): Date | null | undefined {
  if (input === "" || input === null) return null;
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return undefined;
  const d = new Date(`${input}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** A @db.Date column as "September 24, 2026". Read in UTC: the column has no
 *  time, so formatting in the server's local zone could land a day early. */
export function formatReleaseDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
