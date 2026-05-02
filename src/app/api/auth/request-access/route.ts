import { NextResponse } from "next/server";
import { sendMail, esc, wrapHtml } from "@/lib/mailer";

export async function POST(req: Request) {
  const { name, email, usageType } = await req.json();

  if (!name || !email || !usageType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

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

  const ok = await sendMail({
    to: "andybedford62_AL@gmail.com",
    subject: `AuthorLoft Access Request — ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nIntended use: ${usageType}`,
    html,
    replyTo: email,
  });

  if (!ok) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
