import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/marketing/contact — platform-level contact form submission
// Stores the message in DB (linked to no specific author) and can optionally
// trigger an email if SMTP is configured.
export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, subject, message } = body;

  if (!name?.trim())    return NextResponse.json({ error: "Name is required" },    { status: 400 });
  if (!email?.trim())   return NextResponse.json({ error: "Email is required" },   { status: 400 });
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  // Fetch the platform contact email for potential SMTP notification
  const settings = await prisma.platformSettings.findUnique({
    where: { id: "singleton" },
    select: { contactEmail: true },
  }).catch(() => null);

  // Store as a platform contact message (authorId points to the super admin author)
  // For now we store in a generic log — a future enhancement can link to a
  // dedicated PlatformContactMessage model.  We use the existing ContactMessage
  // table with a sentinel authorId if we can resolve the super admin.
  const superAdmin = await prisma.author.findFirst({
    where: { isSuperAdmin: true },
    select: { id: true },
  });

  if (superAdmin) {
    await prisma.contactMessage.create({
      data: {
        authorId:    superAdmin.id,
        senderName:  name.trim(),
        senderEmail: email.trim(),
        subject:     subject?.trim() || "Platform Contact",
        message:     message.trim(),
      },
    });
  }

  // Future: send email to settings.contactEmail via nodemailer / Resend

  return NextResponse.json({ ok: true });
}
