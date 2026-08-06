import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const courses = await prisma.course.findMany({
    where: { authorId },
    include: {
      modules: {
        include: { lessons: { select: { id: true } } },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, coverImageUrl, priceCents, isPublished, modules } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = slugify(title);
  const existing = await prisma.course.findUnique({ where: { authorId_slug: { authorId, slug } } });
  if (existing) {
    return NextResponse.json({ error: "A course with this slug already exists" }, { status: 400 });
  }

  const course = await prisma.course.create({
    data: {
      authorId,
      title: title.trim(),
      slug,
      description: description?.trim() || null,
      coverImageUrl: coverImageUrl?.trim() || null,
      priceCents: priceCents ?? 0,
      isPublished: isPublished ?? false,
      modules: {
        create: (modules ?? []).map((mod: any, mi: number) => ({
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
        })),
      },
    },
    include: {
      modules: {
        include: { lessons: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json({ course }, { status: 201 });
}
