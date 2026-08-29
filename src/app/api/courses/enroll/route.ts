import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendCourseAccessEmail, sendCourseSaleNotificationEmail } from "@/lib/mailer";
import { z } from "zod";

const schema = z.object({
  courseId: z.string().min(1),
  email: z.string().email(),
  name: z.string().max(200).optional(),
  notifyFutureCourses: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { courseId, email, name, notifyFutureCourses } = parsed.data;

  // findFirst + kind, not findUnique by id: a music list must never be
  // enrollable, and the id comes from the caller.
  const course = await prisma.course.findFirst({
    where: { id: courseId, kind: "COURSE" },
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

  // Only subscribe them if they explicitly opted in via the "notify me about
  // future courses" checkbox — unlike a book reader-magnet or purchase, free
  // course enrollment has no other implicit-consent signal, so it's asked for.
  if (notifyFutureCourses) {
    const existingSub = await prisma.subscriber.findUnique({
      where: { authorId_email: { authorId: course.authorId, email } },
      select: { categoryPrefs: true },
    });
    // Empty categoryPrefs means "send me everything" (see Subscriber model) --
    // never narrow an existing all-categories subscriber down to just "courses".
    let categoryPrefs: string[];
    if (!existingSub) {
      categoryPrefs = ["courses"];
    } else if (existingSub.categoryPrefs.length === 0 || existingSub.categoryPrefs.includes("courses")) {
      categoryPrefs = existingSub.categoryPrefs;
    } else {
      categoryPrefs = [...existingSub.categoryPrefs, "courses"];
    }

    await prisma.subscriber.upsert({
      where: { authorId_email: { authorId: course.authorId, email } },
      update: { name, categoryPrefs },
      create: { authorId: course.authorId, email, name, isConfirmed: true, categoryPrefs },
    }).catch((e) => console.error("[enroll] Failed to upsert subscriber:", e));
  }

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
