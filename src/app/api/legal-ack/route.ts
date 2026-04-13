import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST /api/legal-ack — set a cookie acknowledging the current legal document versions
// Body: { type: "privacy" | "terms" | "all", timestamp: ISO string }
export async function POST(req: Request) {
  const body = await req.json();
  const { type, timestamp } = body as { type: "privacy" | "terms" | "all"; timestamp: string };

  const cookieStore = await cookies();
  const maxAge = 60 * 60 * 24 * 365 * 2; // 2 years

  if (type === "privacy" || type === "all") {
    cookieStore.set("bs_privacy_ack", timestamp, {
      httpOnly: false, // readable by client JS for banner check
      path: "/",
      maxAge,
      sameSite: "lax",
    });
  }
  if (type === "terms" || type === "all") {
    cookieStore.set("bs_terms_ack", timestamp, {
      httpOnly: false,
      path: "/",
      maxAge,
      sameSite: "lax",
    });
  }

  return NextResponse.json({ ok: true });
}
