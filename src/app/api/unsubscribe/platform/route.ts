import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/unsubscribe/platform?token=xxx
// One-click unsubscribe from platform emails. No login required.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(page("Invalid link", "This unsubscribe link is missing a token."), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const author = await prisma.author.findUnique({
    where:  { platformEmailsToken: token },
    select: { id: true, email: true, platformEmailOptOut: true },
  });

  if (!author) {
    return new NextResponse(
      page("Link not found", "This unsubscribe link is not valid. You may have already unsubscribed."),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (author.platformEmailOptOut) {
    return new NextResponse(
      page("Already unsubscribed", "You are already opted out of platform emails from AuthorLoft."),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  await prisma.author.update({
    where: { id: author.id },
    data:  { platformEmailOptOut: true },
  });

  return new NextResponse(
    page(
      "You've been unsubscribed",
      "You will no longer receive announcements or promotional emails from AuthorLoft. You will still receive transactional emails such as password resets and billing receipts."
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function page(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | AuthorLoft</title>
  <style>
    body { margin:0; padding:0; background:#f3f4f6;
           font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .card { max-width:480px; margin:80px auto; background:#fff;
            border-radius:12px; padding:40px; text-align:center;
            box-shadow:0 1px 3px rgba(0,0,0,.08); }
    .logo { font-size:1rem; font-weight:700; color:#7c3aed; margin:0 0 24px; }
    h1 { font-size:1.25rem; color:#111827; margin:0 0 12px; }
    p  { font-size:.9rem; color:#6b7280; margin:0; line-height:1.6; }
    .note { margin-top:20px; font-size:.8rem; color:#9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <p class="logo">AuthorLoft</p>
    <h1>${title}</h1>
    <p>${message}</p>
    <p class="note">You can re-enable emails anytime in your account settings.</p>
  </div>
</body>
</html>`;
}
