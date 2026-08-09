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
  const { name, email, supportEmailId, subject, message } = body;

  if (!name?.trim())    return NextResponse.json({ error: "Name is required" },    { status: 400 });
  if (!email?.trim())   return NextResponse.json({ error: "Email is required" },   { status: 400 });
  if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  if (name.trim().length > 200)     return NextResponse.json({ error: "Name too long (max 200 characters)." },    { status: 400 });
  if (email.trim().length > 200)    return NextResponse.json({ error: "Email too long (max 200 characters)." },   { status: 400 });
  if (subject?.trim().length > 200) return NextResponse.json({ error: "Subject too long (max 200 characters)." }, { status: 400 });
  if (message.trim().length > 5000) return NextResponse.json({ error: "Message too long (max 5000 characters)." }, { status: 400 });

  // Resolve destination: selected SupportEmail → contactEmail → env fallback
  const [supportEmail, settings, superAdmin] = await Promise.all([
    supportEmailId
      ? prisma.supportEmail.findUnique({ where: { id: supportEmailId }, select: { email: true, label: true } }).catch(() => null)
      : null,
    prisma.platformSettings.findUnique({ where: { id: "singleton" }, select: { contactEmail: true } }).catch(() => null),
    prisma.author.findFirst({ where: { isSuperAdmin: true }, select: { id: true } }),
  ]);

  if (superAdmin) {
    await prisma.contactMessage.create({
      data: {
        authorId:    superAdmin.id,
        senderName:  name.trim(),
        senderEmail: email.trim(),
        subject:     subject?.trim() || (supportEmail ? `${supportEmail.label} Inquiry` : "Platform Contact"),
        message:     message.trim(),
      },
    });
  }

  const notifyTo = supportEmail?.email || settings?.contactEmail || process.env.SUPER_ADMIN_EMAIL;
  if (notifyTo) {
    const subjectLine = subject?.trim()
      ? `Contact: ${subject.trim()} — ${name.trim()}`
      : `New contact from ${name.trim()}${supportEmail ? ` [${supportEmail.label}]` : ""}`;
    sendMail({
      to:      notifyTo,
      subject: subjectLine,
      replyTo: email.trim(),
      text:    `Name: ${name.trim()}\nEmail: ${email.trim()}\nInquiry Type: ${supportEmail?.label || "General"}\nSubject: ${subject?.trim() || "(none)"}\n\n${message.trim()}`,
      html:    `
        <p><strong>Name:</strong> ${esc(name.trim())}</p>
        <p><strong>Email:</strong> <a href="mailto:${esc(email.trim())}">${esc(email.trim())}</a></p>
        <p><strong>Inquiry Type:</strong> ${esc(supportEmail?.label || "General")}</p>
        <p><strong>Subject:</strong> ${esc(subject?.trim() || "(none)")}</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:12px 0"/>
        <p style="white-space:pre-wrap">${esc(message.trim())}</p>
      `,
    }).catch((err) => console.error("[marketing/contact] notify email failed:", err));
  }

  return NextResponse.json({ ok: true });
}
