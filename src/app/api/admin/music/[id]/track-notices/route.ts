import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseFeature } from "@/lib/plan-limits";
import { loadListTracks, pendingTracks, sendTrackNotice, MIN_NOTICE_GAP_MS } from "@/lib/music-notify";

type Params = { params: Promise<{ id: string }> };

// GET — what the editor panel shows: announced?, new tracks since the last
// notice, the auto-notify setting, and when the next notice is allowed.
export async function GET(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const list = await prisma.course.findFirst({
    where: { id, authorId, kind: "MUSIC" },
    select: { courseAnnouncedAt: true, trackBaselineAt: true, notifiedTrackKeys: true, trackNoticeAt: true, autoNotifyTracks: true },
  });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tracks  = await loadListTracks(id);
  const pending = pendingTracks(list, tracks);
  const nextAllowedAt = list.trackNoticeAt ? new Date(list.trackNoticeAt.getTime() + MIN_NOTICE_GAP_MS) : null;

  return NextResponse.json({
    announced:     !!list.courseAnnouncedAt,
    pending:       pending.map((t) => t.title),
    auto:          list.autoNotifyTracks,
    nextAllowedAt: nextAllowedAt && nextAllowedAt.getTime() > Date.now() ? nextAllowedAt.toISOString() : null,
  });
}

// POST — send the new-tracks email now (the editor button).
export async function POST(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const gate = await canUseFeature(authorId, "newsletter");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const result = await sendTrackNotice(authorId, id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ sent: result.sent, failed: result.failed, total: result.total, count: result.count });
}

// PATCH { auto: boolean } — the auto-notify toggle. Its own route because the
// list PATCH replaces every track with whatever the request carries.
export async function PATCH(req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  if (typeof body?.auto !== "boolean") {
    return NextResponse.json({ error: "auto must be true or false." }, { status: 400 });
  }
  const res = await prisma.course.updateMany({
    where: { id, authorId, kind: "MUSIC" },
    data:  { autoNotifyTracks: body.auto },
  });
  if (res.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ auto: body.auto });
}
