import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/newsletter/unsubscribe?token=xxx
// Called when a reader clicks the unsubscribe link in a newsletter email.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(unsubscribePage("Invalid link", "This unsubscribe link is missing a token."), {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const subscriber = await prisma.subscriber.findFirst({
    where: { unsubscribeToken: token },
    select: { id: true, email: true },
  });

  if (!subscriber) {
    return new NextResponse(
      unsubscribePage("Already removed", "This email address is not on our subscriber list."),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  await prisma.subscriber.delete({ where: { id: subscriber.id } });

  return new NextResponse(
    unsubscribePage(
      "You've been unsubscribed",
      `${subscriber.email} has been removed from this mailing list. You won't receive any further emails.`
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

function unsubscribePage(title: string, message: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#f3f4f6;
           font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .card { max-width:480px; margin:80px auto; background:#fff;
            border-radius:12px; padding:40px; text-align:center;
            box-shadow:0 1px 3px rgba(0,0,0,.08); }
    h1 { font-size:1.25rem; color:#111827; margin:0 0 12px; }
    p  { font-size:.9rem; color:#6b7280; margin:0; line-height:1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
