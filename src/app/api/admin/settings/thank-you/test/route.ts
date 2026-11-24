import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

// Sends the author a sample order confirmation (to their own account email only)
// so they can see their thank-you note as a buyer would. Uses the unsaved draft
// from the request body, so they can preview before saving.
export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();
  const text = typeof message === "string" ? message.trim() : "";
  if (!text) return NextResponse.json({ error: "Write a message first." }, { status: 400 });
  if (text.length > 1500) return NextResponse.json({ error: "Message is too long." }, { status: 400 });

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { email: true, name: true, displayName: true, slug: true, contactEmail: true },
  });
  if (!author?.email) return NextResponse.json({ error: "No account email on file." }, { status: 400 });

  const authorName = author.displayName || author.name || "Author";
  const firstName  = (author.name || "").trim().split(/\s+/)[0] || undefined;

  const ok = await sendOrderConfirmationEmail({
    to: author.email,
    customerName: firstName,
    items: [{
      bookTitle: "Your Book Title",
      itemLabel: "eBook",
      downloadUrl: "#",
      authorName,
      authorSlug: author.slug ?? "",
      priceCents: 999,
    }],
    totalCents: 999,
    discountCents: 0,
    downloadExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    orderId: "PREVIEW0000000000",
    authorNote: { message: text, authorName },
    replyTo: author.contactEmail?.trim() || author.email,
    isTest: true,
  });

  return NextResponse.json({ ok: true, to: author.email, sent: ok !== false });
}
