import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CourseForm } from "@/components/admin/course-form";

export default function NewCoursePage() {
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
      <CourseForm mode="create" />
    </div>
  );
}
