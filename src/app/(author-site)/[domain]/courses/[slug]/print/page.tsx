import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Video } from "lucide-react";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import { sanitize } from "@/lib/sanitize";
import { PrintCourseButton } from "./print-course-button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const course = await prisma.course.findFirst({
    where: { authorId: author.id, slug, isPublished: true },
    select: { title: true },
  });
  return {
    title: course ? `${course.title} — Full Course` : "Course",
    robots: { index: false, follow: false },
  };
}

export default async function CoursePrintPage({
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
    where: { authorId: author.id, slug, isPublished: true },
    include: {
      modules: {
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!course || !course.allowDownload) notFound();

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

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const accentColor = author.accentColor;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Toolbar — hidden when printed */}
      <div className="no-print flex items-center justify-between mb-8">
        <Link
          href={`/courses/${slug}${token ? `/learn?token=${token}` : ""}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to course
        </Link>
        <PrintCourseButton />
      </div>

      {/* Cover */}
      <div className="mb-10 pb-6 border-b-2" style={{ borderColor: accentColor }}>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          {author.name}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
        {course.description && (
          <p className="text-gray-600 leading-relaxed">{course.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-3">
          {course.modules.length} module{course.modules.length !== 1 ? "s" : ""} · {totalLessons} lesson
          {totalLessons !== 1 ? "s" : ""}
        </p>
        {!hasAccess && (
          <p className="mt-4 text-sm rounded-lg bg-amber-50 text-amber-800 px-4 py-3">
            This export only includes free-preview lessons. Enroll in the course to unlock the full export.
          </p>
        )}
      </div>

      {/* Table of contents */}
      <nav className="no-print mb-12">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Contents
        </h2>
        <ol className="space-y-1">
          {course.modules.map((mod, mi) => (
            <li key={mod.id}>
              <p className="text-sm font-medium text-gray-900 mt-3">
                Module {mi + 1}: {mod.title}
              </p>
              <ol className="pl-4 mt-1 space-y-1">
                {mod.lessons.map((les) => {
                  const accessible = hasAccess || les.isPreview;
                  return (
                    <li key={les.id}>
                      <a
                        href={`#lesson-${les.id}`}
                        className={`text-sm inline-flex items-center gap-1.5 ${
                          accessible ? "text-gray-600 hover:text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {les.title}
                        {!accessible && <Lock className="h-3 w-3" />}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </nav>

      {/* Modules & lessons */}
      {course.modules.map((mod, mi) => (
        <section key={mod.id} className="course-print-module mb-12">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Module {mi + 1}
          </p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{mod.title}</h2>
          {mod.description && (
            <p className="text-gray-600 mb-6">{mod.description}</p>
          )}

          {mod.lessons.map((les) => {
            const accessible = hasAccess || les.isPreview;
            return (
              <div key={les.id} id={`lesson-${les.id}`} className="course-print-lesson mb-8 pt-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {les.title}
                </h3>

                {!accessible ? (
                  <p className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg px-4 py-3 inline-flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" /> Enroll in the course to unlock this lesson.
                  </p>
                ) : (
                  <>
                    {les.videoUrl && (
                      <p className="text-sm text-gray-600 mb-3 inline-flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentColor }} />
                        Watch video:{" "}
                        <a href={les.videoUrl} className="underline" style={{ color: accentColor }}>
                          {les.videoUrl}
                        </a>
                      </p>
                    )}
                    {les.contentHtml && (
                      <div
                        className="rich-content"
                        dangerouslySetInnerHTML={{ __html: sanitize(les.contentHtml) }}
                      />
                    )}
                    {les.fileKey && (
                      <p className="text-sm text-gray-600 mt-3">
                        Downloadable resource:{" "}
                        <a
                          href={`/api/courses/lesson-resource/${les.id}${token ? `?token=${token}` : ""}`}
                          className="underline"
                          style={{ color: accentColor }}
                        >
                          {les.fileName || "lesson resource"}
                        </a>
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
