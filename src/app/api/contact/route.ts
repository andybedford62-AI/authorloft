import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, name, email, website, subject, message } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!domain || !name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (message.trim().length > 5000) {
      return NextResponse.json({ error: "Message too long (max 5000 characters)." }, { status: 400 });
    }

    // ── Look up author by subdomain/slug ──────────────────────────────────────
    const author = await prisma.author.findFirst({
      where: {
        OR: [{ slug: domain }, { customDomain: domain }],
        isActive: true,
      },
      select: {
        id: true,
        displayName: true,
        name: true,
        contactEmail: true,
      },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found." }, { status: 404 });
    }

    // ── Basic spam / rate-limit check ─────────────────────────────────────────
    // Max 3 messages from the same email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.contactMessage.count({
      where: {
        authorId: author.id,
        senderEmail: email.toLowerCase(),
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= 3) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429 }
      );
    }

    // ── Save to database ──────────────────────────────────────────────────────
    await prisma.contactMessage.create({
      data: {
        authorId: author.id,
        senderName: name.trim(),
        senderEmail: email.toLowerCase().trim(),
        website: website?.trim() || null,
        subject: subject?.trim() || null,
        message: message.trim(),
      },
    });

    // ── Send email notification to author (if SMTP configured + contactEmail set) ──
    if (author.contactEmail) {
      const authorDisplayName = author.displayName || author.name;
      const emailSubject = subject?.trim()
        ? `New message: ${subject.trim()} — from ${name}`
        : `New contact message from ${name}`;

      const textBody = [
        `You have a new message on your AuthorLoft site.`,
        ``,
        `From:    ${name} <${email}>`,
        subject ? `Subject: ${subject}` : null,
        website ? `Website: ${website}` : null,
        ``,
        `Message:`,
        `--------`,
        message,
        ``,
        `--------`,
        `Reply to this sender by emailing: ${email}`,
        `View all messages: ${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/admin/messages`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: #2563EB; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <p style="margin:0; color: white; font-size: 18px; font-weight: 600;">
              New contact message
            </p>
            <p style="margin:4px 0 0; color: rgba(255,255,255,0.75); font-size: 14px;">
              Sent via your AuthorLoft site
            </p>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
              <tr>
                <td style="padding: 6px 0; color:#6b7280; font-size:14px; width:80px;">From</td>
                <td style="padding: 6px 0; font-size:14px; font-weight:500;">${name} &lt;${email}&gt;</td>
              </tr>
              ${subject ? `<tr><td style="padding: 6px 0; color:#6b7280; font-size:14px;">Subject</td><td style="padding: 6px 0; font-size:14px;">${subject}</td></tr>` : ""}
              ${website ? `<tr><td style="padding: 6px 0; color:#6b7280; font-size:14px;">Website</td><td style="padding: 6px 0; font-size:14px;"><a href="${website}" style="color:#2563EB;">${website}</a></td></tr>` : ""}
            </table>
            <div style="background:#f9fafb; border: 1px solid #e5e7eb; border-radius:6px; padding:16px; font-size:14px; line-height:1.7; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            <div style="margin-top:24px; padding-top:16px; border-top:1px solid #e5e7eb;">
              <a href="mailto:${email}" style="display:inline-block; background:#2563EB; color:white; padding:10px 20px; border-radius:6px; text-decoration:none; font-size:14px; font-weight:500;">
                Reply to ${name}
              </a>
              <a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/admin/messages" style="display:inline-block; margin-left:12px; color:#6b7280; font-size:13px; text-decoration:underline;">
                View all messages
              </a>
            </div>
          </div>
        </div>
      `;

      await sendMail({
        to: author.contactEmail,
        subject: emailSubject,
        text: textBody,
        html: htmlBody,
        replyTo: email,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
