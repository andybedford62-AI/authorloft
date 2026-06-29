import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { sendMail, wrapHtml, esc } from "@/lib/mailer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const replyBody = typeof body.body === "string" ? body.body.trim() : "";
  if (!replyBody) {
    return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
  }

  const msg = await prisma.contactMessage.findFirst({
    where: { id, authorId },
    select: { id: true, senderName: true, senderEmail: true, subject: true, message: true },
  });
  if (!msg) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { displayName: true, email: true, slug: true },
  });
  if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

  const authorName = author.displayName || "AuthorLoft";
  const subject = msg.subject ? `Re: ${msg.subject}` : "Reply from AuthorLoft";
  const siteUrl = `https://${author.slug}.authorloft.com`;

  const html = wrapHtml(
    subject,
    `<p>Hi ${esc(msg.senderName)},</p>
     <p style="white-space:pre-wrap;">${esc(replyBody)}</p>
     <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;" />
     <p style="font-size:13px;color:#6b7280;">
       — ${esc(authorName)}<br />
       <a href="${siteUrl}" style="color:#3b82f6;">${siteUrl}</a>
     </p>`
  );

  const sent = await sendMail({
    to: msg.senderEmail,
    subject,
    text: `Hi ${msg.senderName},\n\n${replyBody}\n\n— ${authorName}\n${siteUrl}`,
    html,
    replyTo: author.email,
    from: `${authorName} via AuthorLoft <noreply@authorloft.com>`,
  });

  if (!sent) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  await prisma.contactMessage.update({
    where: { id },
    data: { hasBeenReplied: true, lastRepliedAt: new Date(), isRead: true },
  });

  return NextResponse.json({ ok: true });
}
