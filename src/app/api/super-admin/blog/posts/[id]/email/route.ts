import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { Resend } from "resend";
import { buildNewsIssueMailPayload } from "@/lib/mailer";

const BATCH_SIZE = 50;

// POST /api/super-admin/blog/posts/[id]/email
// One-click: email a published News post to all confirmed platform subscribers.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const superAdminId = await requireSuperAdminId();
  if (!superAdminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }

  const { id } = await params;
  const post = await prisma.platformPost.findUnique({
    where: { id },
    select: {
      id: true, title: true, slug: true, excerpt: true, coverImageUrl: true,
      isNews: true, isPublished: true, newsEmailedAt: true,
    },
  });

  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (!post.isNews) return NextResponse.json({ error: "Only News posts can be emailed to subscribers." }, { status: 400 });
  if (!post.isPublished) return NextResponse.json({ error: "Publish the post before emailing it." }, { status: 400 });
  if (post.newsEmailedAt) {
    return NextResponse.json({ error: "This post has already been emailed to subscribers." }, { status: 409 });
  }

  const subscribers = await prisma.platformSubscriber.findMany({
    where: { isConfirmed: true },
    select: { email: true, unsubscribeToken: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No confirmed News subscribers to email yet." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const emails = batch.map((s) =>
      buildNewsIssueMailPayload({
        to:               s.email,
        title:            post.title,
        slug:             post.slug,
        excerpt:          post.excerpt,
        coverImageUrl:    post.coverImageUrl,
        unsubscribeToken: s.unsubscribeToken,
      })
    );

    try {
      const result = await resend.batch.send(emails);
      if (result.error) {
        console.error("[news-email] Resend batch error:", result.error);
        failed += batch.length;
      } else {
        const emailResults: any[] = (result.data as any)?.data ?? [];
        const successCount = emailResults.filter((r) => r?.id).length;
        sent   += successCount;
        failed += batch.length - successCount;
      }
    } catch (err) {
      console.error("[news-email] Batch send failed:", err);
      failed += batch.length;
    }

    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // Mark as emailed only if at least one send succeeded (so a total failure can be retried).
  if (sent > 0) {
    await prisma.platformPost.update({
      where: { id: post.id },
      data: { newsEmailedAt: new Date() },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, sent, failed, total: subscribers.length });
}
