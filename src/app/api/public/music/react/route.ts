import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { isBotRequest, isExcludedRequest, resolvePublicTrack, setReaction } from "@/lib/music-stats";

/**
 * POST { trackId, voterId, value: 1 | -1 | 0 } — like, dislike, or clear.
 * voterId is the random id the visitor's browser keeps; only its hash is stored.
 * Returns the fresh public like count (dislikes are never sent to the page).
 */
export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, { bucket: "music-react", maxRequests: 30, windowSeconds: 60 });
  if (limited) return limited;
  if (isBotRequest(req)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  let body: { trackId?: unknown; voterId?: unknown; value?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const trackId = typeof body.trackId === "string" ? body.trackId.slice(0, 40) : "";
  const voterId = typeof body.voterId === "string" && /^[A-Za-z0-9-]{16,64}$/.test(body.voterId) ? body.voterId : "";
  const value = body.value === 1 || body.value === -1 || body.value === 0 ? body.value : null;
  if (!trackId || !voterId || value === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const ref = await resolvePublicTrack(trackId);
    if (!ref) return NextResponse.json({ error: "Not found." }, { status: 404 });
    // The page already disables the buttons for these viewers; this is the backstop.
    if (await isExcludedRequest(req, ref.authorId)) {
      return NextResponse.json({ error: "Your own votes aren't counted." }, { status: 403 });
    }
    const { likes } = await setReaction(ref, voterId, value);
    return NextResponse.json({ likes });
  } catch (err) {
    console.error("[music-react] Error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
