import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { getAuthorPlanLimits } from "@/lib/plan-limits";
import { extractPlaylistId, fetchPlaylist, playlistToCourse } from "@/lib/youtube-playlist";

// Preview-only: turns a playlist URL into the MappedCourseImport shape and
// returns it for the panel to review. Creation goes through the existing
// POST /api/admin/courses/import, so plan limits, title dedup, draft-only
// status and the first-course side effects stay in exactly one place.
// (We still check coursesEnabled here so a FREE-tier author gets told at
// preview time, not after reviewing 50 lessons.)
export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limits = await getAuthorPlanLimits(authorId);
  if (!(limits as any).coursesEnabled) {
    return NextResponse.json(
      { error: "Your current plan does not include courses. Upgrade your plan to import some." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const url = typeof body?.url === "string" ? body.url : "";

  // The fetch targets are always URLs we build ourselves from this validated
  // id — user input never reaches fetch() directly.
  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    return NextResponse.json(
      { error: "That doesn't look like a YouTube playlist link. Paste a URL containing ?list=… (Watch Later and auto-generated mixes can't be imported)." },
      { status: 400 }
    );
  }

  try {
    const fetched = await fetchPlaylist(playlistId);
    return NextResponse.json({
      course: playlistToCourse(fetched),
      source: fetched.source,
      warnings: fetched.warnings,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not fetch that playlist.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
