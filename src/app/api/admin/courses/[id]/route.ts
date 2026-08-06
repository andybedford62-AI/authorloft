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
  const { title, description, coverImageUrl, priceCents, isPublished, modules } = body;

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
