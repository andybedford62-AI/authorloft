import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendPreOrderLaunchEmail } from "@/lib/mailer";
import { getAuthorBaseUrl } from "@/lib/site-url";

/**
 * GET /api/cron/launch-preorders
 * Called daily by Vercel Cron.
 *
 * For each book where:
 *   - isPreOrder = true
 *   - autoSendLaunchEmail = true
 *   - preOrderDate <= now
 *
 * Runs a readiness check (published, has cover, has a way to buy).
 * If it passes: notifies all pending signups, flips isPreOrder → false,
 * autoSendLaunchEmail → false.
 * If it fails: skips the book and logs why — author can fix and re-save,
 * or use the manual "Send Launch Email" button.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const candidates = await prisma.book.findMany({
    where: {
      isPreOrder: true,
      autoSendLaunchEmail: true,
      preOrderDate: { lte: now },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      coverImageUrl: true,
      isPublished: true,
      externalBuyUrl: true,
      directSalesEnabled: true,
      directSaleItems: { select: { id: true }, take: 1 },
      author: {
        select: {
          id: true,
          displayName: true,
          name: true,
          slug: true,
          customDomain: true,
        },
      },
    },
  });

  let launched = 0;
  let skipped  = 0;

  for (const book of candidates) {
    // Readiness check
    const isReady =
      book.isPublished &&
      !!book.coverImageUrl &&
      (book.directSaleItems.length > 0 || !!book.externalBuyUrl);

    if (!isReady) {
      console.log(
        `[cron/launch-preorders] Skipping book ${book.id} "${book.title}" — failed readiness:`,
        {
          isPublished: book.isPublished,
          hasCover: !!book.coverImageUrl,
          hasBuyOption: book.directSaleItems.length > 0 || !!book.externalBuyUrl,
        }
      );
      skipped++;
      continue;
    }

    const pending = await prisma.preOrderSignup.findMany({
      where: { bookId: book.id, notifiedAt: null },
      select: { id: true, email: true, name: true },
    });

    const base    = getAuthorBaseUrl({ slug: book.author.slug, customDomain: book.author.customDomain });
    const bookUrl = `${base}/books/${book.slug}`;
    const authorName = book.author.displayName || book.author.name;

    let sent = 0;
    for (const signup of pending) {
      const ok = await sendPreOrderLaunchEmail({
        to: signup.email,
        readerName: signup.name,
        bookTitle: book.title,
        authorName,
        bookUrl,
        coverImageUrl: book.coverImageUrl,
      }).catch((e) => {
        console.error(`[cron/launch-preorders] Email failed for signup ${signup.id}:`, e);
        return false;
      });
      if (ok) sent++;
    }

    if (pending.length > 0) {
      await prisma.preOrderSignup.updateMany({
        where: { id: { in: pending.map((p) => p.id) } },
        data: { notifiedAt: now },
      });
    }

    await prisma.book.update({
      where: { id: book.id },
      data: { isPreOrder: false, autoSendLaunchEmail: false },
    });

    console.log(`[cron/launch-preorders] Launched book ${book.id} "${book.title}" — sent ${sent}/${pending.length} emails`);
    launched++;
  }

  return NextResponse.json({ ok: true, launched, skipped });
}
