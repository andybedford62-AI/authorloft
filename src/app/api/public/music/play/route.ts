import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { isBotRequest, recordPlay, resolvePublicTrack } from "@/lib/music-stats";

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

    // The musician checking their own page, or a super admin browsing, isn't
    // an audience. The session cookie is scoped to every *.authorloft.com
    // subdomain, so this works on author sites (custom domains can't see it).
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token && (token.sub === ref.authorId || token.isSuperAdmin)) {
      return new NextResponse(null, { status: 204 });
    }

    await recordPlay(ref, req, source);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[music-play] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
