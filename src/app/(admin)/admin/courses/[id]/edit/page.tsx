import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { CourseForm } from "@/components/admin/course-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditCoursePage({ params }: Props) {
  const authorId = await getAdminAuthorId();
  const { id } = await params;

  const [course, author, categoryTree] = await Promise.all([
    prisma.course.findFirst({
      where: { id, authorId },
      include: {
        modules: {
          include: { lessons: { orderBy: { sortOrder: "asc" } } },
          orderBy: { sortOrder: "asc" },
        },
        categories: { select: { categoryId: true } },
      },
    }),
    prisma.author.findUnique({ where: { id: authorId }, select: { plan: { select: { tier: true } } } }),
    // Course Categories are one shared, platform-wide list (Super Admin-curated)
    // — every author picks from the same tree, so this is deliberately NOT
    // filtered by authorId. See docs/CHANGELOG.md Aug 17 2026.
    prisma.courseCategory.findMany({
      where: { parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);
  if (!course) notFound();
  const bookstoreEnabled = (author?.plan?.tier ?? "FREE") !== "FREE";

  const categories = categoryTree.map((c) => ({
    id: c.id,
    name: c.name,
    children: c.children.map((child) => ({ id: child.id, name: child.name })),
  }));

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/courses"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Courses
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium truncate">{course.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
        <p className="text-sm text-gray-500 mt-1">Update the curriculum and details for this course.</p>
      </div>

      <CourseForm
        mode="edit"
        bookstoreEnabled={bookstoreEnabled}
        categories={categories}
        initial={{
          id: course.id,
          title: course.title,
          description: course.description,
          coverImageUrl: course.coverImageUrl,
          priceCents: course.priceCents,
          isPublished: course.isPublished,
          allowDownload: course.allowDownload,
          listInBookstore: course.listInBookstore,
          workbookFileKey: course.workbookFileKey,
          workbookFileName: course.workbookFileName,
          workbookUrl: course.workbookUrl,
          categoryIds: course.categories.map((c) => c.categoryId),
          modules: course.modules.map((m) => ({
            title: m.title,
            description: m.description ?? "",
            lessons: m.lessons.map((l) => ({
              title: l.title,
              contentHtml: l.contentHtml ?? "",
              videoUrl: l.videoUrl ?? "",
              isPreview: l.isPreview,
              fileKey: l.fileKey ?? "",
              fileName: l.fileName ?? "",
            })),
          })),
        }}
      />
    </div>
  );
}
