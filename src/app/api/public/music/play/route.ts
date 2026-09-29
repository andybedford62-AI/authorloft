import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { isBotRequest, isExcludedRequest, recordPlay, resolvePublicTrack } from "@/lib/music-stats";

/**
 * POST { trackId, source: "embed" | "link" } — logs a play click from a public
 * music page. Sent as a beacon, so the response body is never read; it always
 * answers quickly and never tells the page anything it could act on.
 */
export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, { bucket: "music-play", maxRequests: 120, windowSeconds: 60 });
  if (limited) return limited;
  if (isBotRequest(req)) return new NextResponse(null, { status: 204 });

  let body: { trackId?: unknown; source?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const trackId = typeof body.trackId === "string" ? body.trackId.slice(0, 40) : "";
  const source = body.source === "link" ? "link" : "embed";
  if (!trackId) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  try {
    const ref = await resolvePublicTrack(trackId);
    if (!ref) return NextResponse.json({ error: "Not found." }, { status: 404 });

    // The musician and super admins aren't an audience — see isExcludedRequest.
    if (await isExcludedRequest(req, ref.authorId)) return new NextResponse(null, { status: 204 });

    await recordPlay(ref, req, source);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[music-play] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
