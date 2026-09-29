import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { trackStatKey } from "@/lib/music-links";

// Play counts and likes for music tracks. Stats hang off the song
// (authorId + trackStatKey), not the CourseLesson row — see the schema note.
//
// Privacy: plays store only a hash of IP + user agent salted with the date, so
// the same visitor is recognisable within one day and never across days. No
// cookie is set for plays. Reactions use a random id the browser keeps only
// once the visitor has clicked like or dislike, and we store a hash of it.

/** A track's play count stays off public pages until this many listeners. */
export const PUBLIC_PLAYS_THRESHOLD = 10;

export type TrackStats = { plays: number; listeners: number; likes: number; dislikes: number };

const BOT_UA = /bot|crawl|spider|slurp|preview|headless|facebookexternalhit|embedly|lighthouse|pingdom|monitor/i;

export function isBotRequest(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent") ?? "";
  return !ua || BOT_UA.test(ua);
}

function salt(): string {
  return process.env.NEXTAUTH_SECRET ?? "authorloft-music-stats";
}

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function dailyVisitorHash(req: NextRequest, day: Date): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const ua = req.headers.get("user-agent") ?? "";
  return hash(`${salt()}|${day.toISOString().slice(0, 10)}|${ip}|${ua}`);
}

export function voterHash(voterId: string): string {
  return hash(`${salt()}|voter|${voterId}`);
}

export type PublicTrackRef = { authorId: string; courseId: string; trackKey: string };

/** Resolves a track id from a public page — only tracks on a published music list count. */
export async function resolvePublicTrack(trackId: string): Promise<PublicTrackRef | null> {
  const lesson = await prisma.courseLesson.findUnique({
    where: { id: trackId },
    select: {
      videoUrl: true,
      module: { select: { course: { select: { id: true, authorId: true, kind: true, isPublished: true } } } },
    },
  });
  const course = lesson?.module.course;
  if (!lesson?.videoUrl || !course || course.kind !== "MUSIC" || !course.isPublished) return null;
  const trackKey = trackStatKey(lesson.videoUrl);
  return trackKey ? { authorId: course.authorId, courseId: course.id, trackKey } : null;
}

/** Logs one play click; listeners only goes up on a visitor's first play of the song that day. */
export async function recordPlay(ref: PublicTrackRef, req: NextRequest, source: "embed" | "link") {
  const day = todayUtc();
  const visitorHash = dailyVisitorHash(req, day);
  const { authorId, courseId, trackKey } = ref;

  const seenToday = await prisma.musicPlay.findFirst({
    where: { authorId, trackKey, day, visitorHash },
    select: { id: true },
  });

  const write = () =>
    prisma.$transaction([
      prisma.musicPlay.create({ data: { authorId, courseId, trackKey, day, visitorHash, source } }),
      prisma.musicTrackStat.upsert({
        where: { authorId_trackKey: { authorId, trackKey } },
        create: { authorId, trackKey, plays: 1, listeners: seenToday ? 0 : 1 },
        update: { plays: { increment: 1 }, ...(seenToday ? {} : { listeners: { increment: 1 } }) },
      }),
    ]);

  try {
    await write();
  } catch {
    // Two first-ever plays racing on the stat row's unique key — the loser
    // retries once, by which time the row exists and it's a plain increment.
    await write();
  }
}

/** Sets (1 / -1) or clears (0) this browser's reaction and returns the fresh like count. */
export async function setReaction(ref: PublicTrackRef, voterId: string, value: -1 | 0 | 1) {
  const { authorId, trackKey } = ref;
  const key = { authorId_trackKey_voterHash: { authorId, trackKey, voterHash: voterHash(voterId) } };

  if (value === 0) {
    await prisma.musicTrackReaction.deleteMany({ where: key.authorId_trackKey_voterHash });
  } else {
    await prisma.musicTrackReaction.upsert({
      where: key,
      create: { ...key.authorId_trackKey_voterHash, value },
      update: { value },
    });
  }

  // Recounted rather than incremented, so a changed vote can never drift the totals.
  const [likes, dislikes] = await Promise.all([
    prisma.musicTrackReaction.count({ where: { authorId, trackKey, value: 1 } }),
    prisma.musicTrackReaction.count({ where: { authorId, trackKey, value: -1 } }),
  ]);
  await prisma.musicTrackStat.upsert({
    where: { authorId_trackKey: { authorId, trackKey } },
    create: { authorId, trackKey, likes, dislikes },
    update: { likes, dislikes },
  });
  return { likes };
}

/** Stats for a set of track links, keyed by trackStatKey. Links with no stats are absent. */
export async function getTrackStats(authorId: string, urls: (string | null)[]): Promise<Record<string, TrackStats>> {
  const keys = [...new Set(urls.map((u) => (u ? trackStatKey(u) : null)).filter((k): k is string => !!k))];
  if (keys.length === 0) return {};
  const rows = await prisma.musicTrackStat.findMany({
    where: { authorId, trackKey: { in: keys } },
    select: { trackKey: true, plays: true, listeners: true, likes: true, dislikes: true },
  });
  return Object.fromEntries(rows.map(({ trackKey, ...s }) => [trackKey, s]));
}
