import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendCourseAccessEmail, sendCourseSaleNotificationEmail } from "@/lib/mailer";
import { z } from "zod";

const schema = z.object({
  courseId: z.string().min(1),
  email: z.string().email(),
  name: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { courseId, email, name } = parsed.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, slug: true, isPublished: true, priceCents: true, authorId: true, author: { select: { slug: true, displayName: true, name: true, email: true } } },
  });

  if (!course || !course.isPublished) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.priceCents > 0) {
    return NextResponse.json({ error: "This course requires purchase" }, { status: 400 });
  }

  const enrollment = await prisma.courseEnrollment.upsert({
    where: { courseId_customerEmail: { courseId, customerEmail: email } },
    create: { courseId, customerEmail: email, customerName: name },
    update: {},
    select: { accessToken: true },
  });

  // Save the student as a subscriber for the author's newsletter/correspondence,
  // same as a free reader-magnet download does for books.
  await prisma.subscriber.upsert({
    where: { authorId_email: { authorId: course.authorId, email } },
    update: { name },
    create: { authorId: course.authorId, email, name, isConfirmed: true },
  }).catch((e) => console.error("[enroll] Failed to upsert subscriber:", e));

  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
  const accessUrl = `https://${course.author.slug}.${platformDomain}/courses/${course.slug}/learn?token=${enrollment.accessToken}`;
  const authorName = course.author.displayName || course.author.name || "Author";

  sendCourseAccessEmail({
    to: email,
    customerName: name,
    courseTitle: course.title,
    authorName,
    accessUrl,
    isPaid: false,
  }).catch((e) => console.error("[enroll] Failed to send course access email:", e));

  // Notify the author someone selected their course, same as a paid book sale does.
  sendCourseSaleNotificationEmail({
    to: course.author.email,
    authorName,
    customerEmail: email,
    customerName: name,
    courseTitle: course.title,
    priceCents: 0,
  }).catch((e) => console.error("[enroll] Failed to send author notification:", e));

  return NextResponse.json({ accessUrl, accessToken: enrollment.accessToken });
}
