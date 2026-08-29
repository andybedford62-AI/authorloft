import Link from "next/link";
import { Plus, GraduationCap, Upload, Download, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { NavVisibilityBanner } from "@/components/admin/nav-visibility-banner";
import { FeaturedStarButton } from "@/components/admin/featured-star-button";
import { formatCents } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const authorId = await getAdminAuthorId();

  const courses = await prisma.course.findMany({
    where: { authorId, kind: "COURSE" },
    include: {
      modules: {
        include: { lessons: { select: { id: true } } },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { enrollments: true } },
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <NavVisibilityBanner authorId={authorId} navKey="courses" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">
            {courses.length} course{courses.length !== 1 ? "s" : ""} &mdash;{" "}
            {courses.filter((c) => c.isPublished).length} published
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/courses/import">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Courses
            </Button>
          </Link>
          <Link href="/admin/courses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* List */}
      {courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Create courses to teach your expertise &mdash; writing craft, your subject area, or anything your readers want to learn.
          </p>
          <Link href="/admin/courses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);

            return (
              <div
                key={course.id}
                className="relative flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="absolute inset-0 z-0"
                  aria-label={`Edit ${course.title}`}
                />
                {/* Cover */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {course.coverImageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={course.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <GraduationCap className="h-6 w-6 text-gray-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {course.title}
                    </h3>
                    <Badge variant={course.isPublished ? "success" : "outline"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                    {course.allowDownload && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-sky-50 text-sky-600">
                        <Download className="h-2.5 w-2.5" /> Downloadable
                      </span>
                    )}
                    {course.listInBookstore && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-600">
                        <Store className="h-2.5 w-2.5" /> Bookstore
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {course.modules.length} module{course.modules.length !== 1 ? "s" : ""}
                    {" · "}
                    {lessonCount} lesson{lessonCount !== 1 ? "s" : ""}
                    {course._count.enrollments > 0 && ` · ${course._count.enrollments} enrolled`}
                  </p>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {course.priceCents === 0 ? "Free" : formatCents(course.priceCents)}
                  </p>
                </div>

                <FeaturedStarButton
                  endpoint={`/api/admin/courses/${course.id}/feature`}
                  initialFeatured={course.isFeatured}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
