import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mailer";

// Rate limit: max 3 resend attempts per email per hour
const resendAttempts = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 3;

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const attempts = (resendAttempts.get(email) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (attempts.length >= RATE_MAX) return false;
  attempts.push(now);
  resendAttempts.set(email, attempts);
  return true;
}

export async function POST(req: NextRequest) {
  let email: string;
  try {
    const body = await req.json();
    email = (body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  if (!checkRateLimit(email)) {
    return NextResponse.json({ error: "Too many requests. Please wait before trying again." }, { status: 429 });
  }

  const author = await prisma.author.findUnique({
    where: { email },
    select: { id: true, email: true, emailVerified: true },
  });

  // Return generic success to avoid email enumeration
  if (!author || author.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.author.update({
    where: { id: author.id },
    data: { emailVerifyToken: token, emailVerifyExpiry: expiry },
  });

  sendVerificationEmail(author.email, token).catch((err) => {
    console.error("[resend-verification-public] Failed to send email:", err);
  });

  return NextResponse.json({ ok: true });
}
