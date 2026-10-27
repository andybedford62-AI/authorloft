import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseFeature } from "@/lib/plan-limits";
import { sendAnnouncement } from "@/lib/announce-send";
import { htmlToText } from "@/lib/newsletter-format";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/blog/:id/email — opt-in, one-time "new post" email to
// subscribers who want everything or opted in to blog & news. Never automatic:
// the post form calls this only when the author ticks the checkbox.
export async function POST(_req: NextRequest, { params }: Params) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const gate = await canUseFeature(authorId, "newsletter");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const post = await prisma.post.findFirst({
    where: { id, authorId },
    select: { id: true, title: true, slug: true, excerpt: true, content: true, coverImageUrl: true, isPublished: true, emailedAt: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!post.isPublished) {
    return NextResponse.json({ error: "Publish the post before emailing it." }, { status: 400 });
  }
  if (post.emailedAt) {
    return NextResponse.json({ error: "This post has already been emailed." }, { status: 400 });
  }

  // Prefer the author's excerpt; fall back to the opening of the post body.
  const teaser = post.excerpt?.trim()
    || htmlToText(post.content).slice(0, 280).trim()
    || null;

  const result = await sendAnnouncement({
    authorId,
    tag:         "blog",
    subject:     post.title,
    eyebrow:     "New post",
    title:       post.title,
    description: teaser,
    imageUrl:    post.coverImageUrl,
    ctaLabel:    "Read the post",
    ctaPath:     `/blog/${post.slug}`,
    reason:      "you subscribed to updates from",
    noSubscribersError: "No confirmed subscribers to email yet.",
    logTag:      "post-email",
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  await prisma.post.update({ where: { id: post.id }, data: { emailedAt: new Date() } });

  return NextResponse.json({ sent: result.sent, failed: result.failed, total: result.total });
}
