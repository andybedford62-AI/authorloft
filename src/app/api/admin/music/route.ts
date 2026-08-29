import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canAddMusicList, maxTracksPerList } from "@/lib/plan-limits";
import { slugify } from "@/lib/utils";
import { resolveTrackLink, fetchTrackMetadata } from "@/lib/music-links";

// Music lists are Courses with kind MUSIC: one module holding the tracks, each
// track a CourseLesson whose videoUrl is a public streaming link. Nothing is
// uploaded — see lib/music-links.ts.

export type IncomingTrack = {
  url?: string;
  title?: string;
  /** Plain-text note the author typed. */
  description?: string;
  /** The track's existing contentHtml, echoed back by the editor. Lets a
   *  richer note (e.g. one containing an image, as imported course lessons
   *  can) survive an edit that didn't touch the text — PATCH replaces every
   *  lesson row, so without this any save would flatten it. */
  originalHtml?: string;
};

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const stripTags = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** Keeps the original markup when the author left the text alone; otherwise
 *  writes their plain text back as escaped paragraphs. */
export function buildTrackContentHtml(track: IncomingTrack): string | null {
  const text = track.description?.trim();
  const original = track.originalHtml?.trim();
  if (!text) return null;
  if (original && stripTags(original) === text) return original;
  return text.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`).join("\n");
}

/**
 * Validates each pasted URL and fills in the title/artwork from the target
 * page when the author didn't type one. Runs the metadata fetches in parallel
 * (bounded by the plan's track cap) so saving a long list stays quick.
 */
export async function buildTrackRows(tracks: IncomingTrack[], cap: number | null) {
  const limited = cap === null ? tracks : tracks.slice(0, cap);

  const resolved = limited
    .map((t) => ({ raw: t, link: resolveTrackLink(t?.url ?? "") }))
    .filter((r): r is { raw: IncomingTrack; link: NonNullable<ReturnType<typeof resolveTrackLink>> } => r.link !== null);

  const rows = await Promise.all(
    resolved.map(async ({ raw, link }, i) => {
      // Always fetch: artwork is wanted even when the author typed their own
      // title, and it's the only way to get a thumbnail for a link card.
      const meta = await fetchTrackMetadata(link.canonicalUrl);
      return {
        title: raw.title?.trim() || meta.title || `Track ${i + 1}`,
        videoUrl: link.canonicalUrl,
        thumbnailUrl: meta.thumbnailUrl,
        contentHtml: buildTrackContentHtml(raw),
        sortOrder: i,
        isPreview: false,
      };
    })
  );

  return { rows, skipped: limited.length - resolved.length, trimmed: tracks.length - limited.length };
}

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lists = await prisma.course.findMany({
    where: { authorId, kind: "MUSIC" },
    include: { modules: { include: { lessons: { select: { id: true } } } } },
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json({ lists });
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const check = await canAddMusicList(authorId);
  if (!check.allowed) return NextResponse.json({ error: check.reason }, { status: 403 });

  const slug = slugify(title);
  // Slugs are unique per author across BOTH kinds — don't filter this.
  const existing = await prisma.course.findUnique({ where: { authorId_slug: { authorId, slug } } });
  if (existing) {
    return NextResponse.json({ error: "You already have a course or music list with this name." }, { status: 400 });
  }

  const cap = await maxTracksPerList(authorId);
  const { rows, skipped, trimmed } = await buildTrackRows(
    Array.isArray(body?.tracks) ? body.tracks : [],
    cap
  );

  const isFeatured = body?.isFeatured === true;

  const list = await prisma.$transaction(async (tx) => {
    // Only one music list may be featured at a time — see the same guard on
    // the PATCH route and the Course POST/PUT routes.
    if (isFeatured) {
      await tx.course.updateMany({
        where: { authorId, kind: "MUSIC", isFeatured: true },
        data: { isFeatured: false },
      });
    }

    return tx.course.create({
      data: {
        authorId,
        kind: "MUSIC",
        title,
        slug,
        description: typeof body?.description === "string" ? body.description.trim() || null : null,
        coverImageUrl: typeof body?.coverImageUrl === "string" ? body.coverImageUrl.trim() || null : null,
        isPublished: body?.isPublished === true,
        isFeatured,
        // A music list is a flat set of tracks; the single module is structural.
        modules: { create: [{ title: "Tracks", sortOrder: 0, lessons: { create: rows } }] },
      },
      select: { id: true, slug: true },
    });
  });

  // Mirrors the course side: an author whose first music list is this one gets
  // the nav link switched on so the page they just made is actually reachable.
  const total = await prisma.course.count({ where: { authorId, kind: "MUSIC" } });
  if (total === 1) {
    await prisma.author.updateMany({
      where: { id: authorId, navShowMusic: false },
      data: { navShowMusic: true },
    });
  }

  const warnings: string[] = [];
  if (skipped > 0) warnings.push(`${skipped} link${skipped === 1 ? " was" : "s were"} not a usable https URL and ${skipped === 1 ? "was" : "were"} skipped.`);
  if (trimmed > 0) warnings.push(`Your plan allows ${cap} tracks per list — the first ${cap} were kept and ${trimmed} skipped.`);

  return NextResponse.json({ id: list.id, slug: list.slug, warnings });
}
