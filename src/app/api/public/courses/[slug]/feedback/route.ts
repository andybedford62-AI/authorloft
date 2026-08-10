import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Mirrors /api/public/books/[slug]/feedback exactly, adapted for courses.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { domain, reviewerName, reviewerEmail, rating, comment } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!domain || !reviewerName?.trim() || !reviewerEmail?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "A star rating (1–5) is required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewerEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (comment && comment.trim().length > 2000) {
      return NextResponse.json({ error: "Comment too long (max 2000 characters)." }, { status: 400 });
    }

    // ── Resolve author + course ─────────────────────────────────────────────────
    const author = await prisma.author.findFirst({
      where: { OR: [{ slug: domain }, { customDomain: domain }], isActive: true },
      select: { id: true, displayName: true, name: true, contactEmail: true },
    });
    if (!author) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const course = await prisma.course.findFirst({
      where: { authorId: author.id, slug, isPublished: true },
      select: { id: true, title: true },
    });
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

    // ── Rate limit: max 1 submission per email per course per 24h ──────────────
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.courseFeedback.count({
      where: {
        courseId: course.id,
        reviewerEmail: reviewerEmail.toLowerCase(),
        createdAt: { gte: oneDayAgo },
      },
    });
    if (recentCount >= 1) {
      return NextResponse.json(
        { error: "You've already submitted feedback for this course. Please wait 24 hours." },
        { status: 429 },
      );
    }

    // ── Create feedback ───────────────────────────────────────────────────────
    await prisma.courseFeedback.create({
      data: {
        courseId: course.id,
        reviewerName: reviewerName.trim(),
        reviewerEmail: reviewerEmail.toLowerCase().trim(),
        rating: ratingNum,
        comment: comment?.trim() || null,
      },
    });

    // ── Email notification to author ──────────────────────────────────────────
    if (author.contactEmail) {
      const stars = "★".repeat(ratingNum) + "☆".repeat(5 - ratingNum);
      const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

      const textBody = [
        `New reader feedback for "${course.title}"`,
        ``,
        `From:   ${reviewerName} <${reviewerEmail}>`,
        `Rating: ${stars} (${ratingNum}/5)`,
        comment?.trim() ? `\nComment:\n${comment.trim()}` : null,
        ``,
        `Review it at: ${appUrl}/admin/feedback`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: #2563EB; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <p style="margin:0; color: white; font-size: 18px; font-weight: 600;">New reader feedback</p>
            <p style="margin:4px 0 0; color: rgba(255,255,255,0.75); font-size: 14px;">For &ldquo;${esc(course.title)}&rdquo;</p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
              <tr>
                <td style="padding: 6px 0; color:#6b7280; font-size:14px; width:80px;">From</td>
                <td style="padding: 6px 0; font-size:14px; font-weight:500;">${esc(reviewerName)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color:#6b7280; font-size:14px;">Rating</td>
                <td style="padding: 6px 0; font-size:18px; color:#f59e0b;">${stars}</td>
              </tr>
            </table>
            ${comment?.trim() ? `<div style="background:#f9fafb; border: 1px solid #e5e7eb; border-radius:6px; padding:16px; font-size:14px; line-height:1.7;">${esc(comment.trim())}</div>` : ""}
            <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e5e7eb;">
              <a href="${appUrl}/admin/feedback" style="display:inline-block; background:#2563EB; color:white; padding:10px 20px; border-radius:6px; text-decoration:none; font-size:14px; font-weight:500;">
                Review Feedback
              </a>
            </div>
          </div>
        </div>
      `;

      await sendMail({
        to: author.contactEmail,
        subject: `New reader feedback on "${course.title}"`,
        text: textBody,
        html: htmlBody,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[course-feedback] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
