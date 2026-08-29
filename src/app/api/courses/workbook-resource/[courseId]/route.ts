import { NextRequest, NextResponse } from "next/server";
import nodePath from "path";
import { prisma } from "@/lib/db";
import { enforceRateLimit } from "@/lib/api-rate-limit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const token = req.nextUrl.searchParams.get("token");

    const _rl = await enforceRateLimit(req, { bucket: "course-download", maxRequests: 20, windowSeconds: 60 });
    if (_rl) return _rl;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        isPublished: true,
        workbookFileKey: true,
        workbookFileName: true,
        workbookUrl: true,
      },
    });

    if (!course || !course.isPublished) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!course.workbookFileKey && !course.workbookUrl) {
      return NextResponse.json({ error: "No workbook for this course." }, { status: 404 });
    }

    let hasAccess = false;
    if (token) {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: { accessToken: token },
        select: { courseId: true, accessExpiresAt: true },
      });
      if (
        enrollment &&
        enrollment.courseId === courseId &&
        (!enrollment.accessExpiresAt || enrollment.accessExpiresAt > new Date())
      ) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "You need to enroll in this course to download the workbook." }, { status: 403 });
    }

    if (course.workbookUrl) {
      return NextResponse.redirect(course.workbookUrl);
    }

    const fileKey = course.workbookFileKey!;
    if (fileKey.startsWith("/uploads/")) {
      return NextResponse.redirect(new URL(fileKey, req.url));
    }

    const { getSupabaseSignedUrl } = await import("@/lib/supabase-storage");
    const downloadName = course.workbookFileName || nodePath.basename(fileKey);
    const signedUrl = await getSupabaseSignedUrl("course-files", fileKey, 3600, downloadName);

    return NextResponse.redirect(signedUrl);
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[workbook-resource] Error:", msg);
    return NextResponse.json({ error: "Could not generate download link. Please try again." }, { status: 500 });
  }
}
