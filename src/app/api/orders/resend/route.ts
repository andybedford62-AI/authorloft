import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPurchaseConfirmationEmail } from "@/lib/mailer";

// In-memory rate limit: max 3 resends per email per 24 hours
const resendLog = new Map<string, number[]>();
function isRateLimited(email: string): boolean {
  const now = Date.now();
  const window = 24 * 60 * 60 * 1000;
  const limit = 3;
  const prev = (resendLog.get(email) ?? []).filter((t) => now - t < window);
  if (prev.length >= limit) return true;
  resendLog.set(email, [...prev, now]);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email: rawEmail } = body as { token?: string; email?: string };

    if (!token && !rawEmail) {
      return NextResponse.json({ error: "token or email required" }, { status: 400 });
    }

    const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";
    const newExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

    if (token) {
      // Token-based: resend the specific item the buyer clicked
      const item = await prisma.orderItem.findFirst({
        where: { downloadToken: token },
        select: {
          id: true,
          downloadToken: true,
          saleItem: { select: { label: true } },
          book: {
            select: {
              title: true,
              author: { select: { displayName: true, name: true, slug: true } },
            },
          },
          order: { select: { status: true, customerEmail: true, customerName: true } },
        },
      });

      if (!item || item.order.status !== "COMPLETED" || !item.order.customerEmail) {
        return NextResponse.json({ sent: true });
      }

      const email = item.order.customerEmail;
      if (isRateLimited(email)) {
        return NextResponse.json({ sent: true });
      }

      await prisma.orderItem.update({
        where: { id: item.id },
        data: { downloadExpiry: newExpiry },
      });

      const downloadUrl = `https://${item.book.author.slug}.${platformDomain}/api/orders/download/${item.downloadToken}`;
      const authorName = item.book.author.displayName || item.book.author.name;

      await sendPurchaseConfirmationEmail({
        to: email,
        customerName: item.order.customerName ?? undefined,
        bookTitle: item.book.title,
        itemLabel: item.saleItem?.label ?? "eBook",
        downloadUrl,
        downloadExpiry: newExpiry,
        authorName,
        authorSlug: item.book.author.slug,
      });

    } else {
      // Email-based: resend all purchases for this email address
      const email = rawEmail!.toLowerCase().trim();
      if (isRateLimited(email)) {
        return NextResponse.json({ sent: true });
      }

      const orders = await prisma.order.findMany({
        where: { customerEmail: { equals: email, mode: "insensitive" }, status: "COMPLETED" },
        select: {
          customerName: true,
          items: {
            select: {
              id: true,
              downloadToken: true,
              saleItem: { select: { label: true } },
              book: {
                select: {
                  title: true,
                  author: { select: { displayName: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      });

      for (const order of orders) {
        for (const item of order.items) {
          await prisma.orderItem.update({
            where: { id: item.id },
            data: { downloadExpiry: newExpiry },
          });

          const downloadUrl = `https://${item.book.author.slug}.${platformDomain}/api/orders/download/${item.downloadToken}`;
          const authorName = item.book.author.displayName || item.book.author.name;

          sendPurchaseConfirmationEmail({
            to: email,
            customerName: order.customerName ?? undefined,
            bookTitle: item.book.title,
            itemLabel: item.saleItem?.label ?? "eBook",
            downloadUrl,
            downloadExpiry: newExpiry,
            authorName,
            authorSlug: item.book.author.slug,
          }).catch((e) => console.error("[resend] email error:", e));
        }
      }
    }

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error("[resend] error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
