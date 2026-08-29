import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const course = await prisma.course.findFirst({
    where: { id, authorId },
    include: {
      modules: {
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ course });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.course.findFirst({ where: { id, authorId } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, coverImageUrl, priceCents, isPublished, allowDownload, listInBookstore, workbookFileKey, workbookFileName, workbookUrl, categoryIds, modules } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = slugify(title);
  const slugConflict = await prisma.course.findFirst({
    where: { authorId, slug, NOT: { id } },
  });
  if (slugConflict) {
    return NextResponse.json({ error: "A course with this slug already exists" }, { status: 400 });
  }

  // Enforce bookstore listing limit when the author is turning this on (mirrors the same check on Book)
  if (listInBookstore && !existing.listInBookstore) {
    const author = await prisma.author.findUnique({
      where: { id: authorId },
      select: { plan: { select: { bookstoreListingLimit: true } } },
    });
    const limit = author?.plan?.bookstoreListingLimit ?? -1;
    if (limit !== -1) {
      const currentCount = await prisma.course.count({ where: { authorId, kind: "COURSE", listInBookstore: true, id: { not: id } } });
      if (currentCount >= limit) {
        return NextResponse.json(
          { error: `Your plan allows up to ${limit} bookstore listing${limit === 1 ? "" : "s"}. Upgrade to list more.` },
          { status: 403 }
        );
      }
    }
  }

  // Replace category assignments
  if (categoryIds !== undefined) {
    await prisma.courseCategoryAssignment.deleteMany({ where: { courseId: id } });
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      await prisma.courseCategoryAssignment.createMany({
        data: categoryIds.map((categoryId: string) => ({ courseId: id, categoryId })),
      });
    }
  }

  // Replace modules + lessons atomically
  if (modules !== undefined) {
    await prisma.courseModule.deleteMany({ where: { courseId: id } });
    for (let mi = 0; mi < modules.length; mi++) {
      const mod = modules[mi];
      await prisma.courseModule.create({
        data: {
          courseId: id,
          title: mod.title?.trim() || `Module ${mi + 1}`,
          description: mod.description?.trim() || null,
          sortOrder: mi,
          lessons: {
            create: (mod.lessons ?? []).map((les: any, li: number) => ({
              title: les.title?.trim() || `Lesson ${li + 1}`,
              contentHtml: les.contentHtml || null,
              videoUrl: les.videoUrl?.trim() || null,
              fileKey: les.fileKey?.trim() || null,
              fileName: les.fileName?.trim() || null,
              sortOrder: li,
              isPreview: les.isPreview ?? false,
            })),
          },
        },
      });
    }
  }

  const course = await prisma.course.update({
    where: { id },
    data: {
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      coverImageUrl: coverImageUrl !== undefined ? (coverImageUrl?.trim() || null) : existing.coverImageUrl,
      priceCents: priceCents ?? existing.priceCents,
      isPublished: isPublished ?? existing.isPublished,
      allowDownload: allowDownload ?? existing.allowDownload,
      listInBookstore: listInBookstore ?? existing.listInBookstore,
      workbookFileKey: workbookFileKey !== undefined ? (workbookFileKey?.trim() || null) : existing.workbookFileKey,
      workbookFileName: workbookFileName !== undefined ? (workbookFileName?.trim() || null) : existing.workbookFileName,
      workbookUrl: workbookUrl !== undefined ? (workbookUrl?.trim() || null) : existing.workbookUrl,
    },
    include: {
      modules: {
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json({ course });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const course = await prisma.course.findFirst({ where: { id, authorId } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.course.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
