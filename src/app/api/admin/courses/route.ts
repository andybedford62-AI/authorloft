import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";
import { capturePostHog } from "@/lib/posthog";
import { canAddCourse } from "@/lib/plan-limits";

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
  const { title, description, coverImageUrl, priceCents, isPublished, allowDownload, modules } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const courseCheck = await canAddCourse(authorId);
  if (!courseCheck.allowed) {
    return NextResponse.json({ error: courseCheck.reason }, { status: 403 });
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
      allowDownload: allowDownload ?? true,
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

  // First course ever for this author — turn on the "Courses" nav link so it's
  // actually reachable from the live site. Off by default (existing authors who
  // never touch courses shouldn't get an empty nav item); gated on count === 1
  // so it never re-enables a nav item someone deliberately turned back off later.
  const totalCourses = await prisma.course.count({ where: { authorId } });
  if (totalCourses === 1) {
    await prisma.author.updateMany({
      where: { id: authorId, navShowCourses: false },
      data:  { navShowCourses: true },
    });
  }

  // Mark onboarding complete on first course — mirrors the same stamp on first book,
  // so a course-first signup isn't stuck showing the onboarding modal forever.
  const { count: onboardingJustCompleted } = await prisma.author.updateMany({
    where: { id: authorId, onboardingCompletedAt: null },
    data:  { onboardingCompletedAt: new Date() },
  });

  if (onboardingJustCompleted > 0) {
    const author = await prisma.author.findUnique({
      where:  { id: authorId },
      select: { createdAt: true, plan: { select: { tier: true } } },
    });
    if (author) {
      const daysSinceSignup = Math.round(
        (Date.now() - new Date(author.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      capturePostHog(authorId, "first_course_created", {
        days_since_signup: daysSinceSignup,
        plan_tier: author.plan?.tier ?? "FREE",
      });
    }
  }

  return NextResponse.json({ course }, { status: 201 });
}
