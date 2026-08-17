import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { CourseForm } from "@/components/admin/course-form";

export default async function NewCoursePage() {
  const authorId = await getAdminAuthorId();

  // Course Categories are one shared, platform-wide list (Super Admin-curated)
  // — every author picks from the same tree, so this is deliberately NOT
  // filtered by authorId. See docs/CHANGELOG.md Aug 17 2026.
  const categoryTree = await prisma.courseCategory.findMany({
    where: { parentId: null },
    include: { children: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  const categories = categoryTree.map((c) => ({
    id: c.id,
    name: c.name,
    children: c.children.map((child) => ({ id: child.id, name: child.name })),
  }));

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/admin/courses" className="hover:text-gray-900 transition-colors">
          Courses
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">New Course</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a New Course</h1>
      <CourseForm mode="create" categories={categories} />
    </div>
  );
}
