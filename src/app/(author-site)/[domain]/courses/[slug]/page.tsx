import { notFound } from "next/navigation";
import Link from "next/link";
import { GraduationCap, BookOpen, ArrowLeft, Eye, Lock, Video, Download, Star } from "lucide-react";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { formatCents } from "@/lib/utils";
import { CourseBuyButton } from "./course-buy-button";
import { CourseFeedbackForm } from "@/components/author-site/course-feedback-form";
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
    select: { title: true, description: true, coverImageUrl: true },
  });
  if (!course) return {};

  return {
    title: course.title,
    alternates: { canonical: `${getAuthorBaseUrl(author)}/courses/${slug}` },
    description: course.description || `Enroll in ${course.title} — learn from an expert.`,
    openGraph: {
      title: course.title,
      description: course.description || undefined,
      images: course.coverImageUrl ? [{ url: course.coverImageUrl }] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  const course = await prisma.course.findFirst({
    where: { authorId: author.id, slug, isPublished: true },
    include: {
      modules: {
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { enrollments: true } },
      feedback: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" },
        select: { id: true, comment: true, reviewerName: true, rating: true },
      },
    },
  });

  if (!course) notFound();

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const previewLessons = course.modules.reduce(
    (s, m) => s + m.lessons.filter((l) => l.isPreview).length,
    0
  );

  // Global lesson index matches the flat ordering the /learn page builds,
  // so a preview link here lands on the right lesson.
  const lessonGlobalIndex = new Map<string, number>();
  let lessonCounter = 0;
  for (const mod of course.modules) {
    for (const les of mod.lessons) {
      lessonGlobalIndex.set(les.id, lessonCounter++);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Courses
      </Link>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Left: course info + curriculum */}
        <div className="md:col-span-3">
          {course.coverImageUrl && (
            <div className="rounded-xl overflow-hidden mb-6 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.coverImageUrl}
                alt={course.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {course.title}
          </h1>
          {course.description && (
            <p className="text-gray-600 leading-relaxed mb-8">{course.description}</p>
          )}

          {/* Curriculum outline */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Curriculum ({course.modules.length} module{course.modules.length !== 1 ? "s" : ""}, {totalLessons} lesson{totalLessons !== 1 ? "s" : ""})
          </h2>
          <div className="space-y-4">
            {course.modules.map((mod, mi) => (
              <div key={mod.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Module {mi + 1}: {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="text-xs text-gray-500 mt-1">{mod.description}</p>
                  )}
                </div>
                <div className="divide-y divide-gray-50">
                  {mod.lessons.map((les, li) => {
                    const rowContent = (
                      <>
                        <span className="text-gray-400 text-xs w-6 text-center">{li + 1}</span>
                        {les.videoUrl ? (
                          <Video className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="flex-1 text-gray-700">{les.title}</span>
                        {les.isPreview ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium">
                            <Eye className="h-3 w-3" /> Free preview
                          </span>
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-gray-300" />
                        )}
                      </>
                    );

                    return les.isPreview ? (
                      <Link
                        key={les.id}
                        href={`/courses/${slug}/learn?lesson=${lessonGlobalIndex.get(les.id)}`}
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                      >
                        {rowContent}
                      </Link>
                    ) : (
                      <div key={les.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                        {rowContent}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Approved reader feedback */}
          {course.feedback.length > 0 && (
            <div className="pt-8 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">What Students Are Saying</h2>
              <div className="space-y-4">
                {course.feedback.map((fb) => (
                  <blockquote
                    key={fb.id}
                    className="relative pl-5 border-l-4"
                    style={{ borderColor: accentColor }}
                  >
                    <div className="flex gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${n <= fb.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    {fb.comment && (
                      <p className="text-base text-gray-700 leading-relaxed italic">
                        &ldquo;{fb.comment}&rdquo;
                      </p>
                    )}
                    <footer className="mt-2 text-sm text-gray-500">
                      — <span className="font-medium text-gray-700">{fb.reviewerName}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Reader feedback form */}
          <div className="pt-6">
            <CourseFeedbackForm
              courseSlug={course.slug}
              domain={domain}
              accentColor={accentColor}
            />
          </div>
        </div>

        {/* Right: buy card */}
        <div className="md:col-span-2">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            {/* Price */}
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {course.priceCents === 0 ? "Free" : formatCents(course.priceCents)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {course.priceCents === 0
                  ? course.allowDownload
                    ? "Lifetime access — read online or download the full course"
                    : "Lifetime access — watch/read online, no download"
                  : "Lifetime access"}
              </p>
            </div>

            {/* Buy/Enroll button */}
            <CourseBuyButton
              courseId={course.id}
              priceCents={course.priceCents}
              accentColor={accentColor}
            />

            {course.allowDownload && (
              <Link
                href={`/courses/${slug}/print`}
                className="flex items-center justify-center gap-2 text-sm font-medium border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" style={{ color: accentColor }} />
                Print / Download full course
              </Link>
            )}

            {/* Summary */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Modules</span>
                <span className="font-medium text-gray-900">{course.modules.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Lessons</span>
                <span className="font-medium text-gray-900">{totalLessons}</span>
              </div>
              {previewLessons > 0 && (
                <div className="flex justify-between">
                  <span>Free previews</span>
                  <span className="font-medium text-green-600">{previewLessons}</span>
                </div>
              )}
              {course._count.enrollments > 0 && (
                <div className="flex justify-between">
                  <span>Students enrolled</span>
                  <span className="font-medium text-gray-900">{course._count.enrollments}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
