import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { sendPreOrderLaunchEmail } from "@/lib/mailer";
import { getAuthorBaseUrl } from "@/lib/site-url";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const book = await prisma.book.findFirst({ where: { id, authorId }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const signups = await prisma.preOrderSignup.findMany({
    where: { bookId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, notifiedAt: true, createdAt: true },
  });

  return NextResponse.json({
    total: signups.length,
    notified: signups.filter((s) => s.notifiedAt).length,
    signups,
  });
}

/**
 * POST — sends the launch notification email to every signup that hasn't
 * been notified yet, then marks them notified. Intended to be triggered
 * manually by the author once the book is live.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const book = await prisma.book.findFirst({
    where: { id, authorId },
    select: {
      id: true, title: true, slug: true, coverImageUrl: true,
      author: { select: { displayName: true, name: true, slug: true, customDomain: true } },
    },
  });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pending = await prisma.preOrderSignup.findMany({
    where: { bookId: id, notifiedAt: null },
    select: { id: true, email: true, name: true },
  });

  if (pending.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const base = getAuthorBaseUrl({ slug: book.author.slug, customDomain: book.author.customDomain });
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
    }).catch(() => false);
    if (ok) sent++;
  }

  await prisma.preOrderSignup.updateMany({
    where: { id: { in: pending.map((p) => p.id) } },
    data: { notifiedAt: new Date() },
  });

  return NextResponse.json({ sent, total: pending.length });
}
