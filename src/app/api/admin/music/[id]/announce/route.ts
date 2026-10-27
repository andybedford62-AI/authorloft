import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseFeature } from "@/lib/plan-limits";
import { sendAnnouncement } from "@/lib/announce-send";
import { releaseLabel } from "@/lib/music-share";
import { loadListTracks } from "@/lib/music-notify";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/music/:id/announce — one-time "new release" email to
// subscribers who want everything or opted in to music. Music lists share the
// Course model, so courseAnnouncedAt is the once-only guard here too.
export async function POST(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const gate = await canUseFeature(authorId, "newsletter");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const list = await prisma.course.findFirst({
    where: { id, authorId, kind: "MUSIC" },
    select: {
      id: true, title: true, slug: true, description: true, coverImageUrl: true,
      releaseType: true, isPublished: true, courseAnnouncedAt: true,
    },
  });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!list.isPublished) {
    return NextResponse.json({ error: "Publish this list before announcing it." }, { status: 400 });
  }
  if (list.courseAnnouncedAt) {
    return NextResponse.json({ error: "This release has already been announced." }, { status: 400 });
  }

  const trackCount = await prisma.courseLesson.count({ where: { module: { courseId: list.id } } });
  const label = releaseLabel(list.releaseType);

  const result = await sendAnnouncement({
    authorId,
    tag:         "music",
    subject:     `New ${label.toLowerCase()}: ${list.title}`,
    eyebrow:     "New music",
    title:       list.title,
    subtitle:    `${label} · ${trackCount} track${trackCount === 1 ? "" : "s"}`,
    description: list.description,
    imageUrl:    list.coverImageUrl,
    ctaLabel:    "Listen now",
    ctaPath:     `/music/${list.slug}`,
    reason:      "you asked to hear about new music from",
    noSubscribersError: "No subscribers have opted in to music announcements yet.",
    logTag:      "music-announce",
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  // Everything on the list right now counts as announced; later additions become "new tracks".
  const tracks = await loadListTracks(list.id);
  await prisma.course.update({
    where: { id: list.id },
    data: { courseAnnouncedAt: new Date(), notifiedTrackKeys: tracks.map((t) => t.key), trackBaselineAt: new Date() },
  });

  return NextResponse.json({ sent: result.sent, failed: result.failed, total: result.total });
}
