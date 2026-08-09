import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendCourseAccessEmail } from "@/lib/mailer";

const resendLog = new Map<string, number[]>();
function isRateLimited(email: string): boolean {
  const now = Date.now();
  const window = 24 * 60 * 60 * 1000;
  const limit = 3;
  const prev = (resendLog.get(email) ?? []).filter((t) => now - t < window);
  if (prev.length >= limit) return true;
  resendLog.set(email, [...prev, now]);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = (body.email as string | undefined)?.toLowerCase().trim();

    if (!rawEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (isRateLimited(rawEmail)) {
      return NextResponse.json({ sent: true });
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { customerEmail: { equals: rawEmail, mode: "insensitive" } },
      select: {
        accessToken: true,
        customerName: true,
        course: {
          select: {
            title: true,
            slug: true,
            priceCents: true,
            isPublished: true,
            author: { select: { slug: true, displayName: true, name: true } },
          },
        },
      },
    });

    const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

    for (const enrollment of enrollments) {
      if (!enrollment.course.isPublished) continue;

      const accessUrl = `https://${enrollment.course.author.slug}.${platformDomain}/courses/${enrollment.course.slug}/learn?token=${enrollment.accessToken}`;
      const authorName = enrollment.course.author.displayName || enrollment.course.author.name || "Author";

      sendCourseAccessEmail({
        to: rawEmail,
        customerName: enrollment.customerName ?? undefined,
        courseTitle: enrollment.course.title,
        authorName,
        accessUrl,
        isPaid: enrollment.course.priceCents > 0,
        priceCents: enrollment.course.priceCents,
      }).catch((e) => console.error("[resend-access] email error:", e));
    }

    return NextResponse.json({ sent: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[resend-access] error:", message);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
