// YouTube playlist → MappedCourseImport for the Courses importer.
// Produces the exact shape POST /api/admin/courses/import already accepts, so
// plan limits, title dedup, draft-only creation and the first-course side
// effects all come along for free — this file only turns a playlist into that
// shape, it never creates anything itself.
//
// Two data paths:
//  - YOUTUBE_API_KEY set   → Data API v3, paginated, whole playlist (capped).
//  - no key                → the public playlist RSS feed, which YouTube limits
//                            to the 15 most recent entries; we import those and
//                            warn rather than failing outright.

import { MAX_IMPORT_ROWS } from "@/lib/csv-import";
import type { MappedCourseImport } from "@/lib/csv-import-courses";

export type PlaylistVideo = {
  videoId: string;
  title: string;
  description: string | null;
};

export type PlaylistFetchResult = {
  playlistTitle: string | null;
  playlistDescription: string | null;
  videos: PlaylistVideo[];
  source: "api" | "rss";
  warnings: string[];
};

// ── URL parsing ──────────────────────────────────────────────────────────────

const PLAYLIST_ID_RE = /^[A-Za-z0-9_-]{10,64}$/;

/** Pulls the playlist id out of any of the URL shapes people paste:
 *  youtube.com/playlist?list=…, a watch URL with &list=…, youtu.be links,
 *  or a bare id. Returns null for anything else — including WL/LL, the
 *  private Watch Later / Liked lists, which no server can fetch. */
export function extractPlaylistId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let candidate: string | null = null;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase().replace(/^www\.|^m\./, "");
    if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "youtu.be") {
      candidate = u.searchParams.get("list");
    }
  } catch {
    // Not a URL — maybe a bare id.
    candidate = raw;
  }

  if (!candidate || !PLAYLIST_ID_RE.test(candidate)) return null;
  if (candidate === "WL" || candidate === "LL" || candidate.startsWith("RD")) return null; // private/auto mixes
  return candidate;
}

// ── Data API v3 path ─────────────────────────────────────────────────────────

const API_BASE = "https://www.googleapis.com/youtube/v3";

async function fetchPlaylistViaApi(playlistId: string, apiKey: string): Promise<PlaylistFetchResult> {
  const warnings: string[] = [];

  const metaRes = await fetch(
    `${API_BASE}/playlists?part=snippet&id=${playlistId}&key=${apiKey}`,
    { cache: "no-store" }
  );
  if (!metaRes.ok) throw new Error(`YouTube API error (${metaRes.status}) fetching the playlist.`);
  const meta = await metaRes.json();
  const snippet = meta?.items?.[0]?.snippet;
  if (!snippet) throw new Error("Playlist not found — it may be private or deleted.");

  const videos: PlaylistVideo[] = [];
  let pageToken = "";
  let skippedUnavailable = 0;

  while (videos.length < MAX_IMPORT_ROWS) {
    const res = await fetch(
      `${API_BASE}/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}` +
        (pageToken ? `&pageToken=${pageToken}` : "") + `&key=${apiKey}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`YouTube API error (${res.status}) fetching playlist videos.`);
    const page = await res.json();

    for (const item of page?.items ?? []) {
      const s = item?.snippet;
      const videoId = s?.resourceId?.videoId;
      if (!videoId) continue;
      // Deleted/private entries stay in the playlist as placeholders with
      // these literal titles and no thumbnails — skip, don't import stubs.
      if (s.title === "Private video" || s.title === "Deleted video") {
        skippedUnavailable++;
        continue;
      }
      videos.push({
        videoId,
        title: (s.title || "").trim() || `Video ${videos.length + 1}`,
        description: (s.description || "").trim() || null,
      });
      if (videos.length >= MAX_IMPORT_ROWS) break;
    }

    pageToken = page?.nextPageToken ?? "";
    if (!pageToken) break;
  }

  if (skippedUnavailable > 0) {
    warnings.push(`${skippedUnavailable} private or deleted video${skippedUnavailable === 1 ? " was" : "s were"} skipped.`);
  }
  if (pageToken && videos.length >= MAX_IMPORT_ROWS) {
    warnings.push(`Playlist is longer than the ${MAX_IMPORT_ROWS}-lesson import limit — the first ${MAX_IMPORT_ROWS} were used.`);
  }

  return {
    playlistTitle: (snippet.title || "").trim() || null,
    playlistDescription: (snippet.description || "").trim() || null,
    videos,
    source: "api",
    warnings,
  };
}

// ── RSS fallback (no API key) ────────────────────────────────────────────────

/** Minimal tag extractor for YouTube's playlist feed. The feed is
 *  machine-generated Atom with a fixed shape; a full XML parser would be a new
 *  dependency for four tag names. */
function tagText(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  if (!m) return null;
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .trim();
}

export function parsePlaylistRss(xml: string): Omit<PlaylistFetchResult, "source" | "warnings"> {
  const entries = xml.split("<entry>").slice(1);
  const head = xml.split("<entry>")[0];

  const videos: PlaylistVideo[] = [];
  for (const entry of entries) {
    const videoId = tagText(entry, "yt:videoId");
    if (!videoId) continue;
    videos.push({
      videoId,
      title: tagText(entry, "title") || `Video ${videos.length + 1}`,
      description: tagText(entry, "media:description") || null, // empty tag → null, not ""
    });
  }

  return {
    playlistTitle: tagText(head, "title"),
    playlistDescription: null, // the feed has no playlist-level description
    videos,
  };
}

async function fetchPlaylistViaRss(playlistId: string): Promise<PlaylistFetchResult> {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Playlist not found — it may be private, deleted, or the ID is wrong.");
  const parsed = parsePlaylistRss(await res.text());
  if (parsed.videos.length === 0) throw new Error("No videos found in that playlist.");

  return {
    ...parsed,
    source: "rss",
    warnings: [
      // The feed silently truncates; only warn when it plausibly did.
      ...(parsed.videos.length >= 15
        ? ["Without a YouTube API key only the 15 most recent playlist videos are available — longer playlists are truncated. Set YOUTUBE_API_KEY to import whole playlists."]
        : []),
    ],
  };
}

export async function fetchPlaylist(playlistId: string): Promise<PlaylistFetchResult> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  return apiKey ? fetchPlaylistViaApi(playlistId, apiKey) : fetchPlaylistViaRss(playlistId);
}

// ── Mapping to the importer's shape ──────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Video descriptions arrive as plain text; lesson content is sanitized HTML.
 *  Escape and wrap in paragraphs so nothing in a description is ever parsed
 *  as markup. */
export function descriptionToHtml(description: string | null): string | null {
  const text = (description ?? "").trim();
  if (!text) return null;
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function playlistToCourse(fetched: PlaylistFetchResult): MappedCourseImport {
  return {
    title: fetched.playlistTitle || "Imported Course",
    description: fetched.playlistDescription,
    categoryNames: [], // categories are match-only against the curated taxonomy; a playlist carries none
    modules: [
      {
        // Blank title → the create route's "Module 1" default. A playlist is
        // flat; the creator splits it into real modules while reviewing the draft.
        title: "",
        order: 0,
        lessons: fetched.videos.map((v) => ({
          title: v.title,
          contentHtml: descriptionToHtml(v.description),
          videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
          isPreview: false,
        })),
      },
    ],
  };
}
