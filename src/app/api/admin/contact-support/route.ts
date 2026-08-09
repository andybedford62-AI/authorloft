import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { sendMail, esc } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { supportEmailId, subject, message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });

  const [author, supportEmail, superAdmin, settings] = await Promise.all([
    prisma.author.findUnique({ where: { id: authorId }, select: { name: true, email: true } }),
    supportEmailId
      ? prisma.supportEmail.findUnique({ where: { id: supportEmailId }, select: { email: true, label: true } }).catch(() => null)
      : null,
    prisma.author.findFirst({ where: { isSuperAdmin: true }, select: { id: true } }),
    prisma.platformSettings.findUnique({ where: { id: "singleton" }, select: { contactEmail: true } }).catch(() => null),
  ]);

  if (!author) return NextResponse.json({ error: "Author not found." }, { status: 404 });

  const notifyTo = supportEmail?.email || settings?.contactEmail || process.env.SUPER_ADMIN_EMAIL;

  // Store in ContactMessage table linked to super-admin (appears in Messages inbox)
  if (superAdmin) {
    await prisma.contactMessage.create({
      data: {
        authorId:    superAdmin.id,
        senderName:  author.name,
        senderEmail: author.email,
        subject:     `[Author Support${supportEmail ? ` – ${supportEmail.label}` : ""}] ${subject.trim()}`,
        message:     message.trim(),
      },
    });
  }

  if (notifyTo) {
    sendMail({
      to:      notifyTo,
      subject: `[Author Support${supportEmail ? ` – ${supportEmail.label}` : ""}] ${subject.trim()} — ${author.name}`,
      replyTo: author.email,
      text:    `From: ${author.name} <${author.email}>\nType: ${supportEmail?.label || "General"}\nSubject: ${subject.trim()}\n\n${message.trim()}`,
      html:    `
        <p><strong>From:</strong> ${esc(author.name)} &lt;<a href="mailto:${esc(author.email)}">${esc(author.email)}</a>&gt;</p>
        <p><strong>Inquiry Type:</strong> ${esc(supportEmail?.label || "General")}</p>
        <p><strong>Subject:</strong> ${esc(subject.trim())}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0"/>
        <p style="white-space:pre-wrap">${esc(message.trim())}</p>
      `,
    }).catch((err) => console.error("[admin/contact-support] email failed:", err));
  }

  return NextResponse.json({ ok: true, routedTo: notifyTo ?? null });
}
