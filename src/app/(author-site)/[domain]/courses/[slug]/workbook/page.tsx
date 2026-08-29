import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, BookText } from "lucide-react";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const course = await prisma.course.findFirst({
    where: { authorId: author.id, slug, kind: "COURSE", isPublished: true },
    select: { title: true },
  });
  return {
    title: course ? `Workbook — ${course.title}` : "Course Workbook",
    robots: { index: false, follow: false },
  };
}

export default async function CourseWorkbookPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { domain, slug } = await params;
  const { token } = await searchParams;
  const author = await getAuthorByDomain(domain);

  const course = await prisma.course.findFirst({
    where: { authorId: author.id, slug, kind: "COURSE", isPublished: true },
    select: { id: true, title: true, workbookFileKey: true, workbookUrl: true },
  });

  if (!course || (!course.workbookFileKey && !course.workbookUrl)) notFound();

  let hasAccess = false;
  if (token) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { accessToken: token },
    });
    if (
      enrollment &&
      enrollment.courseId === course.id &&
      (!enrollment.accessExpiresAt || enrollment.accessExpiresAt > new Date())
    ) {
      hasAccess = true;
    }
  }

  if (hasAccess) {
    redirect(`/api/courses/workbook-resource/${course.id}?token=${token}`);
  }

  const accentColor = author.accentColor;

  return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      <Link
        href={`/courses/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to course
      </Link>

      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ backgroundColor: `${accentColor}14` }}
      >
        <BookText className="h-6 w-6" style={{ color: accentColor }} />
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-2">
        Enroll to download the workbook
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        The workbook for <strong>{course.title}</strong> is available to enrolled students.
        Enroll in the course to unlock it.
      </p>

      <Link
        href={`/courses/${slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium rounded-lg px-5 py-2.5 text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: accentColor }}
      >
        <Lock className="h-3.5 w-3.5" /> Go to course &amp; enroll
      </Link>
    </div>
  );
}
