import { NextRequest, NextResponse } from "next/server";
import nodePath from "path";
import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/api-rate-limit";

/**
 * GET /api/courses/lesson-resource/[lessonId]?token=...
 *
 * Delivers a course lesson's downloadable attachment (worksheet, slide deck, etc.)
 * via a short-lived signed URL. Access mirrors the /learn page exactly: preview
 * lessons are open to anyone, everything else requires a valid, unexpired
 * CourseEnrollment access token for the lesson's course.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;
    const token = req.nextUrl.searchParams.get("token");

    const _rl = await enforceRateLimit(req, { bucket: "course-download", maxRequests: 20, windowSeconds: 60 });
    if (_rl) return _rl;

    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      select: {
        fileKey: true,
        fileName: true,
        isPreview: true,
        module: { select: { course: { select: { id: true, isPublished: true } } } },
      },
    });

    if (!lesson || !lesson.module.course.isPublished) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!lesson.fileKey) {
      return NextResponse.json({ error: "No downloadable file for this lesson." }, { status: 404 });
    }

    let hasAccess = lesson.isPreview;
    if (!hasAccess && token) {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: { accessToken: token },
        select: { courseId: true, accessExpiresAt: true },
      });
      if (
        enrollment &&
        enrollment.courseId === lesson.module.course.id &&
        (!enrollment.accessExpiresAt || enrollment.accessExpiresAt > new Date())
      ) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "You need to enroll in this course to download this file." }, { status: 403 });
    }

    // Local filesystem fallback (development without Supabase) — fileKey is already a public path.
    if (lesson.fileKey.startsWith("/uploads/")) {
      return NextResponse.redirect(new URL(lesson.fileKey, req.url));
    }

    const { getSupabaseSignedUrl } = await import("@/lib/supabase-storage");
    const downloadName = lesson.fileName || nodePath.basename(lesson.fileKey);
    const signedUrl = await getSupabaseSignedUrl("course-files", lesson.fileKey, 3600, downloadName);

    return NextResponse.redirect(signedUrl);
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[lesson-resource] Error:", msg);
    return NextResponse.json({ error: "Could not generate download link. Please try again." }, { status: 500 });
  }
}
