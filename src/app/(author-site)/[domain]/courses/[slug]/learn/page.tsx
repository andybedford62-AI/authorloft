import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Video, CheckCircle, Lock } from "lucide-react";
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
    where: { authorId: author.id, slug, isPublished: true },
    select: { title: true },
  });
  return { title: course ? `Learn: ${course.title}` : "Course" };
}

function extractVideoEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const match = u.pathname.match(/\/(\d+)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch {}
  return null;
}

export default async function CourseLearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ domain: string; slug: string }>;
  searchParams: Promise<{ token?: string; lesson?: string }>;
}) {
  const { domain, slug } = await params;
  const { token, lesson: lessonIndex } = await searchParams;
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

  if (!course) notFound();

  // Validate access
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

  // Build flat lesson list
  const allLessons: { moduleTitle: string; moduleIndex: number; lesson: typeof course.modules[0]["lessons"][0]; globalIndex: number }[] = [];
  for (let mi = 0; mi < course.modules.length; mi++) {
    for (const les of course.modules[mi].lessons) {
      allLessons.push({ moduleTitle: course.modules[mi].title, moduleIndex: mi, lesson: les, globalIndex: allLessons.length });
    }
  }

  // Determine active lesson
  const requestedIndex = parseInt(lessonIndex ?? "0", 10);
  const activeLessonEntry = allLessons[requestedIndex] ?? allLessons[0];
  if (!activeLessonEntry) notFound();

  const canView = hasAccess || activeLessonEntry.lesson.isPreview;

  if (!canView && !hasAccess) {
    redirect(`/courses/${slug}?access=required`);
  }

  const activeLesson = activeLessonEntry.lesson;
  const embedUrl = activeLesson.videoUrl ? extractVideoEmbed(activeLesson.videoUrl) : null;
  const accentColor = author.accentColor;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar — lesson list */}
      <aside className="w-full md:w-72 lg:w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <Link
            href={`/courses/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Course overview
          </Link>
          <h2 className="font-semibold text-gray-900 mt-2 text-sm truncate">{course.title}</h2>
        </div>
        <nav className="p-2 space-y-1">
          {allLessons.map((entry) => {
            const isActive = entry.globalIndex === (requestedIndex || 0);
            const accessible = hasAccess || entry.lesson.isPreview;
            return (
              <Link
                key={entry.lesson.id}
                href={accessible ? `/courses/${slug}/learn?${token ? `token=${token}&` : ""}lesson=${entry.globalIndex}#lesson-content` : "#"}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-white shadow-sm border border-gray-200 font-medium text-gray-900"
                    : accessible
                      ? "text-gray-600 hover:bg-white hover:text-gray-900"
                      : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {entry.lesson.videoUrl ? (
                  <Video className="h-3.5 w-3.5 flex-shrink-0" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                )}
                <span className="flex-1 truncate">{entry.lesson.title}</span>
                {!accessible && <Lock className="h-3 w-3 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main id="lesson-content" className="flex-1 overflow-y-auto scroll-mt-4">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Module {activeLessonEntry.moduleIndex + 1}: {activeLessonEntry.moduleTitle}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{activeLesson.title}</h1>

          {/* Video embed */}
          {embedUrl && (
            <div className="aspect-video rounded-xl overflow-hidden bg-black mb-8">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeLesson.title}
              />
            </div>
          )}

          {/* Lesson content */}
          {activeLesson.contentHtml && (
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: activeLesson.contentHtml }}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200">
            {requestedIndex > 0 ? (
              <Link
                href={`/courses/${slug}/learn?${token ? `token=${token}&` : ""}lesson=${requestedIndex - 1}#lesson-content`}
                className="text-sm font-medium hover:underline"
                style={{ color: accentColor }}
              >
                &larr; Previous lesson
              </Link>
            ) : (
              <span />
            )}
            {requestedIndex < allLessons.length - 1 && (hasAccess || allLessons[requestedIndex + 1]?.lesson.isPreview) ? (
              <Link
                href={`/courses/${slug}/learn?${token ? `token=${token}&` : ""}lesson=${requestedIndex + 1}#lesson-content`}
                className="text-sm font-medium hover:underline"
                style={{ color: accentColor }}
              >
                Next lesson &rarr;
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
