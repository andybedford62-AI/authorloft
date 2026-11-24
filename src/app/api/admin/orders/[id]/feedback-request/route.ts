import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { sendFeedbackRequestEmail, type FeedbackTarget } from "@/lib/mailer";

const MAX_MESSAGE = 1500;
const MAX_TARGETS = 3; // one "Rate …" button per item; a huge bundle shouldn't make a wall of buttons

// POST /api/admin/orders/[id]/feedback-request
//   { message, resend? } -> email the buyer the author's (pre-filled, editable) thanks + rating links.
// One send per order unless resend === true. Only the selling author, only completed orders.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Write a message first." }, { status: 400 });
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: `Keep the message under ${MAX_MESSAGE} characters.` }, { status: 400 });
  }
  const resend = body.resend === true;

  const order = await prisma.order.findFirst({
    where: { id, authorId, status: "COMPLETED" },
    select: {
      id: true,
      customerEmail: true,
      followUpSentAt: true,
      author: { select: { slug: true, customDomain: true, displayName: true, name: true, contactEmail: true, email: true } },
      items: {
        select: {
          book:   { select: { title: true, slug: true } },
          course: { select: { title: true, slug: true } },
        },
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (!order.customerEmail) return NextResponse.json({ error: "This order has no buyer email." }, { status: 400 });
  if (order.followUpSentAt && !resend) {
    return NextResponse.json({ error: "You've already sent a follow-up for this order." }, { status: 409 });
  }

  // Build the rating links server-side from the DB, never from the client.
  const base = getAuthorBaseUrl(order.author);
  const seen = new Set<string>();
  const targets: FeedbackTarget[] = [];
  for (const item of order.items) {
    if (item.book && !seen.has(`b:${item.book.slug}`)) {
      seen.add(`b:${item.book.slug}`);
      targets.push({ title: item.book.title, url: `${base}/books/${item.book.slug}#write-review` });
    } else if (item.course && !seen.has(`c:${item.course.slug}`)) {
      seen.add(`c:${item.course.slug}`);
      targets.push({ title: item.course.title, url: `${base}/courses/${item.course.slug}#feedback` });
    }
  }
  if (targets.length === 0) {
    return NextResponse.json({ error: "Nothing on this order can be rated." }, { status: 400 });
  }

  // Claim the send first so two quick clicks can't both go out; roll back if the email fails.
  const previous = order.followUpSentAt;
  const claimed = await prisma.order.updateMany({
    where: resend ? { id: order.id } : { id: order.id, followUpSentAt: null },
    data: { followUpSentAt: new Date() },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ error: "You've already sent a follow-up for this order." }, { status: 409 });
  }

  const sent = await sendFeedbackRequestEmail({
    to: order.customerEmail,
    authorName: order.author.displayName || order.author.name || "Your author",
    message,
    targets: targets.slice(0, MAX_TARGETS),
    replyTo: order.author.contactEmail?.trim() || order.author.email || undefined,
  }).catch((e) => {
    console.error("[orders/feedback-request] email failed:", e);
    return false;
  });

  if (sent === false) {
    await prisma.order.update({ where: { id: order.id }, data: { followUpSentAt: previous } });
    return NextResponse.json({ error: "The email could not be sent. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, followUpSentAt: new Date().toISOString() });
}
