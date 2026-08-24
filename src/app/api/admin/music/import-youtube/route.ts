import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canAddMusicList, maxTracksPerList } from "@/lib/plan-limits";
import { extractPlaylistId, fetchPlaylist } from "@/lib/youtube-playlist";

// Preview only, mirroring the courses importer: turns a playlist into the shape
// POST /api/admin/music already accepts, and lets that route do the creating —
// so plan limits, slug collision, metadata and track caps stay in one place.
//
// The playlist fetching itself is shared with the courses importer
// (lib/youtube-playlist.ts); only the mapping differs, because a music track is
// a link row rather than a lesson.

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Checked here so an author at their list limit is told before reviewing 40
  // tracks, not after.
  const check = await canAddMusicList(authorId);
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 403 });

  const body = await req.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";

  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    return NextResponse.json(
      { error: "That doesn't look like a YouTube playlist link. Paste a URL containing ?list=… (Watch Later and auto-generated mixes can't be imported)." },
      { status: 400 }
    );
  }

  try {
    const fetched = await fetchPlaylist(playlistId);
    const cap = await maxTracksPerList(authorId);

    const all = fetched.videos.map((v) => ({
      url: `https://www.youtube.com/watch?v=${v.videoId}`,
      title: v.title,
      description: v.description ?? "",
    }));
    const tracks = cap === null ? all : all.slice(0, cap);

    const warnings = [...fetched.warnings];
    if (cap !== null && all.length > cap) {
      warnings.push(
        `Your plan allows ${cap} tracks per list — the first ${cap} of ${all.length} are shown.`
      );
    }

    return NextResponse.json({
      title: fetched.playlistTitle ?? "Imported Playlist",
      description: fetched.playlistDescription ?? "",
      tracks,
      source: fetched.source,
      warnings,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not fetch that playlist.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
