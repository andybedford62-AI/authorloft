import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";

// GET /api/newsletter/confirm?token=xxx
// Double opt-in confirmation link sent by /api/newsletter/subscribe.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(page("Invalid link", "This confirmation link is missing a token.", null), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const subscriber = await prisma.subscriber.findFirst({
    where: { confirmToken: token },
    select: {
      id: true, isConfirmed: true,
      author: { select: { slug: true, customDomain: true, displayName: true, name: true } },
    },
  });

  if (!subscriber) {
    return new NextResponse(
      page("Link not valid", "This confirmation link has already been used or has expired. If you'd like to subscribe, sign up again from the author's site.", null),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!subscriber.isConfirmed) {
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: { isConfirmed: true, confirmToken: null },
    });
  }

  const authorName = subscriber.author.displayName || subscriber.author.name;
  const authorUrl = getAuthorBaseUrl(subscriber.author);

  return new NextResponse(
    page(
      "You're subscribed!",
      `Your subscription to ${authorName}'s newsletter is confirmed.`,
      authorUrl,
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function page(title: string, message: string, ctaUrl: string | null) {
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
    a.cta { display:inline-block; margin-top:20px; background:#1d4ed8; color:#fff;
            font-size:.85rem; font-weight:600; padding:10px 20px; border-radius:8px;
            text-decoration:none; }
  </style>
</head>
<body>
  <div class="card">
    <p class="logo">AuthorLoft</p>
    <h1>${title}</h1>
    <p>${message}</p>
    ${ctaUrl ? `<a class="cta" href="${ctaUrl}">Visit the site</a>` : ""}
  </div>
</body>
</html>`;
}
