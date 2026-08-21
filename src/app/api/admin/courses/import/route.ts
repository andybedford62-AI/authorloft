import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { getAuthorPlanLimits } from "@/lib/plan-limits";
import { capturePostHog } from "@/lib/posthog";
import { slugify } from "@/lib/utils";
import type { MappedCourseImport } from "@/lib/csv-import-courses";

function uniqueSlug(base: string, used: Set<string>): string {
  let slug = base || "course";
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

/** Appends " (2)", " (3)"… to a title on collision, per author, so re-importing
 *  the same CSV (or importing a course with the same name as an existing one)
 *  creates a copy instead of erroring out. */
function uniqueTitle(base: string, used: Set<string>): string {
  let title = base || "Untitled Course";
  let n = 2;
  while (used.has(title.toLowerCase())) title = `${base} (${n++})`;
  used.add(title.toLowerCase());
  return title;
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const courses: MappedCourseImport[] = Array.isArray(body?.courses) ? body.courses : [];

  if (courses.length === 0) {
    return NextResponse.json({ error: "No courses to import." }, { status: 400 });
  }

  const warnings: string[] = [];

  const validCourses = courses.filter((c) => typeof c?.title === "string" && c.title.trim() !== "");
  if (validCourses.length < courses.length) {
    const skipped = courses.length - validCourses.length;
    warnings.push(`${skipped} course${skipped === 1 ? "" : "s"} without a title were skipped.`);
  }

  const limits = await getAuthorPlanLimits(authorId);
  if (!(limits as any).coursesEnabled) {
    return NextResponse.json({ error: "Your current plan does not include courses. Upgrade your plan to import some." }, { status: 403 });
  }

  const maxCourses = (limits as any).maxCourses as number | null;
  const currentCount = await prisma.course.count({ where: { authorId } });
  const remaining = maxCourses === null ? validCourses.length : Math.max(0, maxCourses - currentCount);

  const toImport = validCourses.slice(0, remaining);
  const skippedForPlanLimit = validCourses.length - toImport.length;

  if (toImport.length === 0) {
    return NextResponse.json({ imported: 0, skippedForPlanLimit, warnings });
  }

  const existingCourses = await prisma.course.findMany({ where: { authorId }, select: { title: true, slug: true } });
  const usedTitles = new Set(existingCourses.map((c) => c.title.toLowerCase()));
  const usedSlugs  = new Set(existingCourses.map((c) => c.slug));

  // Course Categories are ONE shared, Super Admin-curated taxonomy (read
  // unscoped by authorId — see api/admin/course-categories/route.ts). So a CSV
  // category is matched against the existing list, never auto-created: letting
  // importers mint categories would fragment the curated taxonomy.
  const existingCategories = await prisma.courseCategory.findMany({ select: { id: true, name: true } });
  const categoryByName = new Map(existingCategories.map((c) => [c.name.trim().toLowerCase(), c.id]));
  const unmatchedCategories = new Set<string>();

  let imported = 0;

  await prisma.$transaction(async (tx) => {
    for (const course of toImport) {
      const title = uniqueTitle(course.title.trim(), usedTitles);
      const slug = uniqueSlug(slugify(title) || "course", usedSlugs);

      const categoryIds: string[] = [];
      for (const rawName of course.categoryNames ?? []) {
        const name = rawName.trim();
        if (!name) continue;
        const id = categoryByName.get(name.toLowerCase());
        if (id) {
          if (!categoryIds.includes(id)) categoryIds.push(id);
        } else {
          unmatchedCategories.add(name);
        }
      }

      await tx.course.create({
        data: {
          authorId,
          title,
          slug,
          description: course.description || null,
          ...(categoryIds.length > 0
            ? { categories: { create: categoryIds.map((categoryId) => ({ categoryId })) } }
            : {}),
          modules: {
            create: (course.modules ?? []).map((mod, mi) => ({
              title: mod.title?.trim() || `Module ${mi + 1}`,
              sortOrder: mi,
              lessons: {
                create: (mod.lessons ?? []).map((les, li) => ({
                  title: les.title?.trim() || `Lesson ${li + 1}`,
                  contentHtml: les.contentHtml || null,
                  videoUrl: les.videoUrl || null,
                  sortOrder: li,
                  isPreview: les.isPreview ?? false,
                })),
              },
            })),
          },
          // isPublished intentionally omitted — schema default (false) already
          // lands imported courses as drafts for review.
        },
      });

      imported++;
    }
  });

  if (unmatchedCategories.size > 0) {
    const names = Array.from(unmatchedCategories).sort();
    const shown = names.slice(0, 5).join(", ");
    const rest = names.length > 5 ? `, and ${names.length - 5} more` : "";
    warnings.push(
      `${names.length} categor${names.length === 1 ? "y" : "ies"} in your file didn't match an existing course category and were skipped: ${shown}${rest}. Ask an administrator to add them, then set them on the course.`
    );
  }

  // Mirror the side effects from POST /api/admin/courses — a course creator
  // may onboard entirely through an import, so their first course(s) still
  // need to flip on the nav link and clear the onboarding modal.
  const totalCourses = await prisma.course.count({ where: { authorId } });
  if (totalCourses === imported) {
    await prisma.author.updateMany({
      where: { id: authorId, navShowCourses: false },
      data:  { navShowCourses: true },
    });
  }

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

  return NextResponse.json({ imported, skippedForPlanLimit, warnings });
}
