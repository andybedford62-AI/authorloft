// "New tracks" notices for music lists. The editor deletes and recreates every
// track row on each save, so tracks have no stable id: they are identified by
// their link (falling back to the title), and a list remembers which keys
// subscribers were already told about.
import { prisma } from "@/lib/db";
import { trackStatKey } from "@/lib/music-links";
import { sendAnnouncement } from "@/lib/announce-send";

export const MIN_NOTICE_GAP_MS = 24 * 60 * 60 * 1000;
export const QUIET_PERIOD_MS   = 2 * 60 * 60 * 1000;

export interface ListTrack { key: string; title: string }

export function trackKeyOf(t: { videoUrl: string | null; title: string }): string {
  return (t.videoUrl ? trackStatKey(t.videoUrl) : null) ?? `t:${t.title.trim().toLowerCase()}`;
}

export async function loadListTracks(courseId: string): Promise<ListTrack[]> {
  const lessons = await prisma.courseLesson.findMany({
    where:   { module: { courseId } },
    orderBy: [{ module: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select:  { title: true, videoUrl: true },
  });
  const seen = new Set<string>();
  const out: ListTrack[] = [];
  for (const l of lessons) {
    const key = trackKeyOf(l);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ key, title: l.title });
  }
  return out;
}

/** Tracks not yet announced. Empty until a baseline exists (announce or first save after it). */
export function pendingTracks(
  list: { courseAnnouncedAt: Date | null; trackBaselineAt: Date | null; notifiedTrackKeys: string[] },
  tracks: ListTrack[],
): ListTrack[] {
  if (!list.courseAnnouncedAt || !list.trackBaselineAt) return [];
  const known = new Set(list.notifiedTrackKeys);
  return tracks.filter((t) => !known.has(t.key));
}

export type TrackNoticeOutcome =
  | { ok: true; sent: number; failed: number; total: number; count: number }
  | { ok: false; error: string; status: number };

/**
 * Emails subscribers about a list's un-announced tracks and records them as
 * announced. Shared by the editor button and the daily cron. `quiet` makes the
 * cron skip a list saved recently (author likely mid-edit).
 */
export async function sendTrackNotice(
  authorId: string,
  listId: string,
  opts: { quiet?: boolean } = {},
): Promise<TrackNoticeOutcome> {
  const list = await prisma.course.findFirst({
    where: { id: listId, authorId, kind: "MUSIC" },
    select: {
      id: true, title: true, slug: true, coverImageUrl: true, isPublished: true,
      courseAnnouncedAt: true, trackBaselineAt: true, notifiedTrackKeys: true,
      trackNoticeAt: true, updatedAt: true,
    },
  });
  if (!list) return { ok: false, error: "Not found", status: 404 };
  if (!list.isPublished) return { ok: false, error: "Publish this list first.", status: 400 };
  if (!list.courseAnnouncedAt) {
    return { ok: false, error: "Announce this release first; new-track notices follow the announcement.", status: 400 };
  }

  const now = Date.now();
  if (list.trackNoticeAt && now - list.trackNoticeAt.getTime() < MIN_NOTICE_GAP_MS) {
    return { ok: false, error: "A new-tracks email already went out in the last 24 hours. Try again tomorrow so subscribers get one email, not several.", status: 429 };
  }
  if (opts.quiet && now - list.updatedAt.getTime() < QUIET_PERIOD_MS) {
    return { ok: false, error: "Edited recently; waiting for the author to finish.", status: 409 };
  }

  const tracks  = await loadListTracks(list.id);
  const pending = pendingTracks(list, tracks);
  if (pending.length === 0) return { ok: false, error: "No new tracks to announce.", status: 400 };

  const n = pending.length;
  const result = await sendAnnouncement({
    authorId,
    tag:        "music",
    subject:    n === 1 ? `New track on ${list.title}: ${pending[0].title}` : `${n} new tracks on ${list.title}`,
    eyebrow:    "New tracks",
    title:      list.title,
    subtitle:   `${n} new track${n === 1 ? "" : "s"} added`,
    items:      pending.slice(0, 10).map((t) => t.title).concat(n > 10 ? [`…and ${n - 10} more`] : []),
    imageUrl:   list.coverImageUrl,
    ctaLabel:   "Listen now",
    ctaPath:    `/music/${list.slug}`,
    reason:     "you asked to hear about new music from",
    noSubscribersError: "No subscribers have opted in to music announcements yet.",
    logTag:     "music-track-notice",
  });
  if (!result.ok) return result;

  // Recorded even on partial failures: like the other announce sends, a retry
  // would re-email people who already got it.
  await prisma.course.update({
    where: { id: list.id },
    data: {
      notifiedTrackKeys: Array.from(new Set([...list.notifiedTrackKeys, ...tracks.map((t) => t.key)])),
      trackNoticeAt:     new Date(),
    },
  });
  return { ok: true, sent: result.sent, failed: result.failed, total: result.total, count: n };
}
