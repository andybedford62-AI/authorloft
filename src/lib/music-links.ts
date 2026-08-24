// Music tracks are links to public streaming pages — nothing is uploaded or
// stored. This resolves a pasted URL into either an embeddable player or a
// link-out card, and fetches the title/artwork once at save time so public
// pages never call a third-party site per view.
//
// Whether a site CAN be embedded is the site's decision, not ours: Suno serves
// `frame-ancestors 'none'`, so no page anywhere may iframe it. Treating an
// un-embeddable provider as embeddable produces a blank grey box — the exact
// failure the course-video CSP bug caused. Hence two render modes.

export type MusicProvider = "youtube" | "spotify" | "suno" | "other";
export type TrackRenderMode = "embed" | "link";

export type ResolvedTrackLink = {
  provider: MusicProvider;
  mode: TrackRenderMode;
  /** iframe src — only ever set when mode === "embed". */
  embedUrl: string | null;
  /** Where a link-card click goes, and where metadata is read from. */
  canonicalUrl: string;
  /** Suggested iframe height in px; providers differ a lot. */
  embedHeight: number | null;
};

const PROVIDER_LABELS: Record<MusicProvider, string> = {
  youtube: "YouTube",
  spotify: "Spotify",
  suno: "Suno",
  other: "the artist's page",
};

export function providerLabel(provider: MusicProvider): string {
  return PROVIDER_LABELS[provider];
}

function hostOf(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\.|^m\./, "");
}

/** YouTube video id from any of watch?v=, youtu.be/, /embed/, /shorts/. */
function youtubeId(u: URL): string | null {
  const host = hostOf(u);
  if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
  const v = u.searchParams.get("v");
  if (v) return v;
  const m = u.pathname.match(/\/(?:embed|shorts|v)\/([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

/**
 * Resolves a pasted URL. Unknown hosts are NOT rejected — they become link
 * cards, so a provider we've never seen still works on the day it's pasted.
 * Returns null only when the input isn't a usable https URL at all.
 */
export function resolveTrackLink(input: string): ResolvedTrackLink | null {
  const raw = (input ?? "").trim();
  if (!raw) return null;

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  // http:// would be blocked as mixed content on our https pages anyway.
  if (u.protocol !== "https:") return null;

  const host = hostOf(u);

  // ── YouTube: embeddable, via the no-cookie host (matches the course viewer)
  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    const id = youtubeId(u);
    if (id) {
      return {
        provider: "youtube",
        mode: "embed",
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
        embedHeight: 200,
      };
    }
    // A channel or playlist page, not a single video — link out instead.
    return { provider: "youtube", mode: "link", embedUrl: null, canonicalUrl: u.toString(), embedHeight: null };
  }

  // ── Spotify: embeddable via /embed/<type>/<id>, confirmed against their oEmbed
  if (host === "open.spotify.com" || host === "spotify.com") {
    const m = u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/);
    if (m) {
      const [, type, id] = m;
      return {
        provider: "spotify",
        mode: "embed",
        embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
        canonicalUrl: `https://open.spotify.com/${type}/${id}`,
        // A single track is a compact bar; collections need room for a list.
        embedHeight: type === "track" || type === "episode" ? 152 : 352,
      };
    }
    return { provider: "spotify", mode: "link", embedUrl: null, canonicalUrl: u.toString(), embedHeight: null };
  }

  // ── Suno: serves `frame-ancestors 'none'`, so it can never be embedded.
  //    Verified against a live share URL — this is not a guess.
  if (host === "suno.com" || host === "suno.ai") {
    return { provider: "suno", mode: "link", embedUrl: null, canonicalUrl: u.toString(), embedHeight: null };
  }

  // ── Anything else degrades to a card rather than failing.
  return { provider: "other", mode: "link", embedUrl: null, canonicalUrl: u.toString(), embedHeight: null };
}

// ── Save-time metadata ───────────────────────────────────────────────────────

export type TrackMetadata = { title: string | null; thumbnailUrl: string | null };

/** Hosts we refuse to fetch, so an author-supplied URL can't be aimed at our
 *  own network. Public streaming links never resolve to any of these. */
function isBlockedFetchTarget(u: URL): boolean {
  const h = u.hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal")) return true;
  if (h === "metadata.google.internal" || h === "169.254.169.254") return true;
  // Literal private / loopback / link-local IPv4 and IPv6.
  if (/^(10|127)\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (h === "::1" || h.startsWith("[")) return true;
  return false;
}

function metaContent(html: string, property: string): string | null {
  // Matches both property="og:x" and name="og:x", attribute order either way.
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      return m[1]
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .trim() || null;
    }
  }
  return null;
}

export function parseOpenGraph(html: string): TrackMetadata {
  return {
    title: metaContent(html, "og:title") ?? metaContent(html, "twitter:title"),
    thumbnailUrl: metaContent(html, "og:image") ?? metaContent(html, "twitter:image"),
  };
}

/**
 * Reads a track's title/artwork from its page, once, when the author saves it.
 * Best-effort by design: a failure just means the author types a title, so
 * every error path returns nulls rather than throwing.
 */
export async function fetchTrackMetadata(url: string): Promise<TrackMetadata> {
  const empty: TrackMetadata = { title: null, thumbnailUrl: null };

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return empty;
  }
  if (u.protocol !== "https:" || isBlockedFetchTarget(u)) return empty;

  // YouTube thumbnails are derivable from the id, so skip the fetch entirely.
  const resolved = resolveTrackLink(url);
  const ytId = resolved?.provider === "youtube" ? youtubeId(u) : null;

  try {
    const res = await fetch(u.toString(), {
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "AuthorLoftBot/1.0 (+https://www.authorloft.com)" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(String(res.status));

    // Cap the read: og tags live in <head>, so 256KB is plenty and a huge or
    // endless response can't tie up the request.
    const body = (await res.text()).slice(0, 256 * 1024);
    const meta = parseOpenGraph(body);
    return {
      title: meta.title,
      thumbnailUrl: meta.thumbnailUrl ?? (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null),
    };
  } catch {
    return ytId
      ? { title: null, thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` }
      : empty;
  }
}

// ── Bulk paste ───────────────────────────────────────────────────────────────

export type PastedTrack = { url: string; title: string; description: string };

export type PasteParseResult = {
  tracks: PastedTrack[];
  /** Lines that held something but no usable https link, for honest feedback. */
  invalidLines: string[];
};

/**
 * Parses a pasted block into track rows. One entry per line; a title and note
 * may follow the link, separated by a TAB, a vertical bar, or a comma.
 *
 * TAB is checked first deliberately: selecting cells in Excel or Google Sheets
 * and copying produces tab-separated text, so a spreadsheet paste just works
 * without anyone exporting a CSV or mapping columns.
 *
 * Splitting stops after three fields, so commas inside a note survive.
 */
export function parsePastedTracks(input: string): PasteParseResult {
  const tracks: PastedTrack[] = [];
  const invalidLines: string[] = [];

  for (const rawLine of (input ?? "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;      // blank and comment lines

    // First delimiter present wins, so a note containing a comma still parses
    // correctly when the row came from a spreadsheet.
    const delimiter = line.includes("\t") ? "\t" : line.includes("|") ? "|" : ",";
    const parts = splitAtMost(line, delimiter, 3).map((p) => p.trim());

    const link = resolveTrackLink(parts[0] ?? "");
    if (!link) {
      invalidLines.push(line);
      continue;
    }

    tracks.push({
      url: link.canonicalUrl,
      title: parts[1] ?? "",
      description: parts[2] ?? "",
    });
  }

  return { tracks, invalidLines };
}

/** split() with a cap that keeps the remainder in the final field. */
function splitAtMost(value: string, delimiter: string, max: number): string[] {
  const out: string[] = [];
  let rest = value;
  while (out.length < max - 1) {
    const i = rest.indexOf(delimiter);
    if (i === -1) break;
    out.push(rest.slice(0, i));
    rest = rest.slice(i + delimiter.length);
  }
  out.push(rest);
  return out;
}
