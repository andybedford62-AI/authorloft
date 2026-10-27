import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseFeature } from "@/lib/plan-limits";
import { sendAnnouncement } from "@/lib/announce-send";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const newsletterCheck = await canUseFeature(authorId, "newsletter");
  if (!newsletterCheck.allowed) {
    return NextResponse.json({ error: newsletterCheck.reason }, { status: 403 });
  }

  const course = await prisma.course.findFirst({
    where: { id, authorId, kind: "COURSE" },
    select: {
      id: true, title: true, slug: true, description: true, coverImageUrl: true,
      priceCents: true, isPublished: true, courseAnnouncedAt: true,
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!course.isPublished) {
    return NextResponse.json({ error: "Publish the course before announcing it." }, { status: 400 });
  }
  if (course.courseAnnouncedAt) {
    return NextResponse.json({ error: "This course has already been announced." }, { status: 400 });
  }

  const result = await sendAnnouncement({
    authorId,
    tag:         "courses",
    subject:     `New course: ${course.title}`,
    eyebrow:     "New course",
    title:       course.title,
    subtitle:    course.priceCents === 0 ? "Free" : `$${(course.priceCents / 100).toFixed(2)}`,
    description: course.description,
    imageUrl:    course.coverImageUrl,
    ctaLabel:    "View the course",
    ctaPath:     `/courses/${course.slug}`,
    reason:      "you asked to hear about new courses from",
    noSubscribersError: "No subscribers have opted in to course announcements yet.",
    logTag:      "course-announce",
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  // Stamped regardless of partial send failures -- this is a one-time,
  // deliberately-clicked action, and retrying would resend to people who
  // already got it.
  await prisma.course.update({
    where: { id: course.id },
    data: { courseAnnouncedAt: new Date() },
  });

  return NextResponse.json({ sent: result.sent, failed: result.failed, total: result.total });
}
