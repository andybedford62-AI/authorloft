import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { capturePostHog } from "@/lib/posthog";

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { event, properties } = await req.json();
    if (typeof event !== "string" || !event) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }
    capturePostHog(authorId, event, properties ?? {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
