import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { maxTracksPerList } from "@/lib/plan-limits";
import { slugify } from "@/lib/utils";
import { buildTrackRows } from "../route";

/** Every handler scopes by authorId AND kind, so a course id can't be driven
 *  through the music endpoints (or vice versa). */
async function findOwned(id: string, authorId: string) {
  return prisma.course.findFirst({ where: { id, authorId, kind: "MUSIC" } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = await prisma.course.findFirst({
    where: { id, authorId, kind: "MUSIC" },
    include: { modules: { include: { lessons: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } } },
  });
  if (!list) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ list });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await findOwned(id, authorId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : existing.title;
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  // Only re-slug on an actual rename, so existing public URLs stay put.
  let slug = existing.slug;
  if (title !== existing.title) {
    const candidate = slugify(title);
    const clash = await prisma.course.findUnique({ where: { authorId_slug: { authorId, slug: candidate } } });
    if (clash && clash.id !== id) {
      return NextResponse.json({ error: "You already have a course or music list with this name." }, { status: 400 });
    }
    slug = candidate;
  }

  const cap = await maxTracksPerList(authorId);
  const { rows, skipped, trimmed } = await buildTrackRows(
    Array.isArray(body?.tracks) ? body.tracks : [],
    cap
  );

  // Tracks are a small ordered set with no state of their own, so replacing
  // them wholesale is simpler and safer than diffing — and it can't strand a
  // row at a stale sortOrder.
  const isFeatured = typeof body?.isFeatured === "boolean" ? body.isFeatured : undefined;

  await prisma.$transaction(async (tx) => {
    // Only one music list may be featured at a time — see the same guard on Course PUT/POST.
    if (isFeatured) {
      await tx.course.updateMany({
        where: { authorId, kind: "MUSIC", id: { not: id }, isFeatured: true },
        data: { isFeatured: false },
      });
    }

    await tx.course.update({
      where: { id },
      data: {
        title,
        slug,
        description: typeof body?.description === "string" ? body.description.trim() || null : existing.description,
        coverImageUrl: typeof body?.coverImageUrl === "string" ? body.coverImageUrl.trim() || null : existing.coverImageUrl,
        ...(typeof body?.isPublished === "boolean" ? { isPublished: body.isPublished } : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
      },
    });

    const modules = await tx.courseModule.findMany({ where: { courseId: id }, select: { id: true } });
    const moduleId = modules[0]?.id
      ?? (await tx.courseModule.create({ data: { courseId: id, title: "Tracks", sortOrder: 0 }, select: { id: true } })).id;

    await tx.courseLesson.deleteMany({ where: { moduleId } });
    if (rows.length > 0) {
      await tx.courseLesson.createMany({ data: rows.map((r) => ({ ...r, moduleId })) });
    }
  });

  const warnings: string[] = [];
  if (skipped > 0) warnings.push(`${skipped} link${skipped === 1 ? " was" : "s were"} not a usable https URL and ${skipped === 1 ? "was" : "were"} skipped.`);
  if (trimmed > 0) warnings.push(`Your plan allows ${cap} tracks per list — the first ${cap} were kept and ${trimmed} skipped.`);

  return NextResponse.json({ id, slug, warnings });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await findOwned(id, authorId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Modules and lessons cascade from Course (see schema onDelete: Cascade).
  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
