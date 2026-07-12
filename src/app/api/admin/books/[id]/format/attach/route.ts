import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * POST /api/admin/books/[id]/format/attach
 *
 * Takes a completed Auto-Formatter conversion and attaches the resulting
 * .epub to an existing part of the book — a Direct Sales eBook item, a
 * Reader Magnet, or an ARC — without the author having to re-upload it.
 *
 * Body: { jobId, target: "direct-sales" | "reader-magnet" | "arc" }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;
  const book = await prisma.book.findFirst({ where: { id: bookId, authorId } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const body = await req.json();
  const { jobId, target } = body;

  if (!["direct-sales", "reader-magnet", "arc"].includes(target)) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const job = await prisma.bookFormatJob.findFirst({ where: { id: jobId, bookId, authorId } });
  if (!job || job.status !== "DONE" || !job.epubFileKey) {
    return NextResponse.json({ error: "No converted file found for that job" }, { status: 404 });
  }

  const fileUrl = `${SUPABASE_URL}/storage/v1/object/book-files/${job.epubFileKey}`;
  const fileName = job.epubFileName ?? "converted.epub";

  if (target === "arc") {
    const arc = await prisma.arcCopy.findFirst({ where: { bookId, book: { authorId } } });
    if (!arc) {
      return NextResponse.json(
        { error: "Create an ARC for this book first (ARC tab), then attach the converted file." },
        { status: 400 }
      );
    }
    const file = await prisma.arcFile.upsert({
      where: { arcCopyId_format: { arcCopyId: arc.id, format: "EPUB" } },
      create: { arcCopyId: arc.id, format: "EPUB", fileUrl, fileKey: job.epubFileKey, fileName },
      update: { fileUrl, fileKey: job.epubFileKey, fileName },
    });
    return NextResponse.json({ ok: true, arcFile: file });
  }

  // direct-sales / reader-magnet — both live on a BookDirectSaleItem (EBOOK format)
  let item = await prisma.bookDirectSaleItem.findFirst({ where: { bookId, format: "EBOOK" } });
  if (!item) {
    const count = await prisma.bookDirectSaleItem.count({ where: { bookId } });
    item = await prisma.bookDirectSaleItem.create({
      data: {
        bookId,
        format: "EBOOK",
        label: "eBook",
        priceCents: 0,
        isReaderMagnet: target === "reader-magnet",
        sortOrder: count,
        fileUrl,
        fileKey: job.epubFileKey,
        fileName,
      },
    });
  } else {
    item = await prisma.bookDirectSaleItem.update({
      where: { id: item.id },
      data: {
        fileUrl,
        fileKey: job.epubFileKey,
        fileName,
        ...(target === "reader-magnet" && { isReaderMagnet: true }),
      },
    });
  }

  if (!book.directSalesEnabled) {
    await prisma.book.update({ where: { id: bookId }, data: { directSalesEnabled: true } });
  }

  return NextResponse.json({ ok: true, saleItem: item });
}
