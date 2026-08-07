import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { getAuthorPlanLimits } from "@/lib/plan-limits";
import { CourseImportWizard } from "@/components/admin/course-import-wizard";

export const dynamic = "force-dynamic";

export default async function CourseImportPage() {
  const authorId = await getAdminAuthorId();

  const [courseCount, author] = await Promise.all([
    prisma.course.count({ where: { authorId } }),
    prisma.author.findUnique({ where: { id: authorId }, select: { plan: { select: { tier: true } } } }),
  ]);

  const limits     = await getAuthorPlanLimits(authorId);
  const maxCourses = (limits as any).maxCourses as number | null;
  const remainingSlots = maxCourses === null ? null : Math.max(0, maxCourses - courseCount);
  const planTier = author?.plan?.tier ?? "FREE";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Courses
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import Courses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bulk-add your curriculum from a CSV file — one row per lesson. Imported courses are saved as drafts so you can
          review them before publishing.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CourseImportWizard
          remainingSlots={remainingSlots}
          maxCourses={maxCourses}
          planTier={planTier}
        />
      </div>
    </div>
  );
}
