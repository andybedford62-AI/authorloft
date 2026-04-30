import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail, esc } from "@/lib/mailer";

// ── Rate limiting (in-memory, best-effort for serverless) ─────────────────────
const attempts = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 5;

function checkRateLimit(ip: string): boolean {
  const now  = Date.now();
  const hits = (attempts.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return false;
  hits.push(now);
  attempts.set(ip, hits);
  return true;
}

// POST /api/marketing/contact — platform-level contact form submission
// Stores the message in DB (linked to no specific author) and can optionally
// trigger an email if SMTP is configured.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

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

  // Notify platform owner — fire-and-forget, never blocks the response
  const notifyTo = settings?.contactEmail || process.env.SUPER_ADMIN_EMAIL;
  if (notifyTo) {
    const subjectLine = subject?.trim()
      ? `Contact: ${subject.trim()} — ${name.trim()}`
      : `New contact from ${name.trim()}`;
    sendMail({
      to:       notifyTo,
      subject:  subjectLine,
      replyTo:  email.trim(),
      text:     `Name: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject?.trim() || "(none)"}\n\n${message.trim()}`,
      html:     `
        <p><strong>Name:</strong> ${esc(name.trim())}</p>
        <p><strong>Email:</strong> <a href="mailto:${esc(email.trim())}">${esc(email.trim())}</a></p>
        <p><strong>Subject:</strong> ${esc(subject?.trim() || "(none)")}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0"/>
        <p style="white-space:pre-wrap">${esc(message.trim())}</p>
      `,
    }).catch((err) => console.error("[marketing/contact] notify email failed:", err));
  }

  return NextResponse.json({ ok: true });
}
