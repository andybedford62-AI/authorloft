import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail, esc, wrapHtml } from "@/lib/mailer";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const rateLimitKey = getRateLimitKey(req, "ip", "request-access");
  const rateLimitResult = await checkRateLimit(rateLimitKey, RATE_LIMITS.auth);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString() } }
    );
  }

  const { name, email, usageType } = await req.json();

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" || !email.trim() ||
    typeof usageType !== "string" || !usageType.trim()
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (name.length > 200 || email.length > 200 || usageType.length > 2000) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }

  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  await prisma.accessRequest.create({
    data: { name: name.trim(), email: email.toLowerCase().trim(), usageType: usageType.trim() },
  });

  const html = wrapHtml(
    "New Access Request",
    `<p>Someone has requested access to AuthorLoft.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;font-weight:600;color:#6b7280;width:140px;">Name</td>
        <td style="padding:10px 0;">${esc(name)}</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 0;font-weight:600;color:#6b7280;">Email</td>
        <td style="padding:10px 0;"><a href="mailto:${esc(email)}" style="color:#2563eb;">${esc(email)}</a></td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-weight:600;color:#6b7280;">Intended use</td>
        <td style="padding:10px 0;">${esc(usageType)}</td>
      </tr>
    </table>`
  );

  await sendMail({
    to: "andybedford62@gmail.com",
    subject: `AuthorLoft Access Request — ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nIntended use: ${usageType}`,
    html,
    replyTo: email,
  });

  return NextResponse.json({ success: true });
}
