import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { maxTracksPerList } from "@/lib/plan-limits";
import { trackStatKey } from "@/lib/music-links";

// POST /api/admin/music/move-tracks
// Body: { lessonIds: string[], toListId: string, onDuplicate?: "allow" }
//
// Moves tracks (CourseLesson rows) into another of the author's music lists,
// appended to the end. A move, not a copy: the track leaves its old list.
//
// Play counts and likes are keyed by author + track URL, not lesson id, so
// they follow the song automatically.
//
// Responses: 200 { moved, fromListIds }, 403 target at the plan's track cap,
// 409 { duplicates } when the target already has the same song and the caller
// hasn't passed onDuplicate: "allow".
export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const lessonIds: string[] = Array.isArray(body?.lessonIds)
    ? [...new Set<string>(body.lessonIds.filter((x: unknown): x is string => typeof x === "string"))]
    : [];
  const toListId = typeof body?.toListId === "string" ? body.toListId : "";
  if (lessonIds.length === 0 || !toListId) {
    return NextResponse.json({ error: "lessonIds and toListId are required" }, { status: 400 });
  }

  const target = await prisma.course.findFirst({
    where: { id: toListId, authorId, kind: "MUSIC" },
    select: { id: true, title: true },
  });
  if (!target) return NextResponse.json({ error: "Destination list not found" }, { status: 404 });

  // Scoped by author AND kind through the lesson's course, so a course lesson
  // (or another author's track) can't be driven through this endpoint.
  const lessons = await prisma.courseLesson.findMany({
    where: { id: { in: lessonIds }, module: { course: { authorId, kind: "MUSIC", id: { not: toListId } } } },
    select: { id: true, title: true, videoUrl: true, module: { select: { courseId: true } } },
  });
  if (lessons.length === 0) {
    return NextResponse.json(
      { error: "Those tracks weren't found, or are already in that list. Reload the page and try again." },
      { status: 404 }
    );
  }

  const [cap, existing] = await Promise.all([
    maxTracksPerList(authorId),
    prisma.courseLesson.findMany({
      where: { module: { courseId: toListId } },
      select: { videoUrl: true, sortOrder: true },
    }),
  ]);

  if (cap !== null && existing.length + lessons.length > cap) {
    const room = Math.max(0, cap - existing.length);
    return NextResponse.json(
      {
        error: room === 0
          ? `"${target.title}" already has ${cap} tracks, the most your plan allows per list.`
          : `"${target.title}" has room for ${room} more track${room === 1 ? "" : "s"} on your plan (${cap} per list).`,
      },
      { status: 403 }
    );
  }

  if (body?.onDuplicate !== "allow") {
    const have = new Set(existing.map((e) => (e.videoUrl ? trackStatKey(e.videoUrl) ?? e.videoUrl : "")).filter(Boolean));
    const duplicates = lessons
      .filter((l) => l.videoUrl && have.has(trackStatKey(l.videoUrl) ?? l.videoUrl))
      .map((l) => l.title);
    if (duplicates.length > 0) {
      return NextResponse.json(
        { error: `"${target.title}" already has ${duplicates.join(", ")}.`, duplicates },
        { status: 409 }
      );
    }
  }

  const fromListIds = [...new Set(lessons.map((l) => l.module.courseId))];

  await prisma.$transaction(async (tx) => {
    // Same module the track editor uses (first one), created if the list has none.
    const targetModule =
      (await tx.courseModule.findFirst({ where: { courseId: toListId }, orderBy: { sortOrder: "asc" }, select: { id: true } })) ??
      (await tx.courseModule.create({ data: { courseId: toListId, title: "Tracks", sortOrder: 0 }, select: { id: true } }));

    let next = existing.reduce((m, e) => Math.max(m, e.sortOrder), -1) + 1;
    // Keep the order they had on screen: by source list, then position.
    const ordered = await tx.courseLesson.findMany({
      where: { id: { in: lessons.map((l) => l.id) } },
      orderBy: [{ module: { courseId: "asc" } }, { sortOrder: "asc" }],
      select: { id: true },
    });
    for (const { id } of ordered) {
      await tx.courseLesson.update({ where: { id }, data: { moduleId: targetModule.id, sortOrder: next++ } });
    }

    // Bump updatedAt on every list touched — Course.updatedAt only moves on a Course write.
    await tx.course.updateMany({ where: { id: { in: [toListId, ...fromListIds] } }, data: { updatedAt: new Date() } });
  });

  return NextResponse.json({ moved: lessons.length, fromListIds });
}
