import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import mammoth from "mammoth";
import epub from "epub-gen-memory";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { getSupabaseSignedUrl, uploadToSupabaseStorage } from "@/lib/supabase-storage";

/**
 * POST /api/admin/books/[id]/format/convert
 *
 * Step 2 of the Auto-Formatter flow. Downloads the previously-uploaded .docx,
 * converts it to HTML (mammoth), splits it into chapters on Heading 1 breaks,
 * packages it as an .epub (epub-gen-memory), and stores the result.
 *
 * Body: { fileKey, fileName }
 * Returns: { job } — the completed (or failed) BookFormatJob row.
 */

type ChapterHtml = { title: string; content: string };

function splitIntoChapters(html: string): ChapterHtml[] {
  // Split just before every <h1> tag — mammoth maps Word's "Heading 1" style to <h1>.
  const parts = html.split(/(?=<h1[ >])/i).filter((p) => p.trim());
  const chapters: ChapterHtml[] = [];

  for (const part of parts) {
    const match = part.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const text = part.replace(/<[^>]+>/g, "").trim();
    if (!text) continue;

    if (match) {
      const title = match[1].replace(/<[^>]+>/g, "").trim() || `Chapter ${chapters.length + 1}`;
      // Strip the <h1> itself from the content — epub-gen-memory re-renders `title` as
      // its own <h1> (prependChapterTitles), so leaving it in here doubles the heading.
      const content = part.slice(match.index! + match[0].length);
      chapters.push({ title, content });
    } else {
      // Text before the first Heading 1 (title page, dedication, etc.)
      chapters.push({ title: "Front Matter", content: part });
    }
  }

  if (chapters.length === 0) {
    chapters.push({ title: "Chapter 1", content: html });
  }
  return chapters;
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const _rl = await enforceRateLimit(req, { bucket: "auto-format", maxRequests: 5, windowSeconds: 60, userId: authorId });
  if (_rl) return _rl;

  const { id: bookId } = await params;
  const book = await prisma.book.findFirst({
    where: { id: bookId, authorId },
    select: { id: true, title: true, coverImageUrl: true, author: { select: { name: true, displayName: true } } },
  });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const body = await req.json();
  const { fileKey, fileName } = body;
  if (!fileKey || typeof fileKey !== "string" || !fileKey.startsWith(`${authorId}/`)) {
    return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
  }
  if (!fileName || typeof fileName !== "string") {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 });
  }

  const job = await prisma.bookFormatJob.create({
    data: { bookId, authorId, sourceFileKey: fileKey, sourceName: fileName, status: "CONVERTING" },
  });

  try {
    // Download the uploaded manuscript from Supabase Storage
    const signedUrl = await getSupabaseSignedUrl("book-files", fileKey, 300);
    const docxRes = await fetch(signedUrl);
    if (!docxRes.ok) throw new Error(`Could not read uploaded file (${docxRes.status})`);
    const docxBuffer = Buffer.from(await docxRes.arrayBuffer());

    // DOCX -> HTML
    const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
    if (!html.replace(/<[^>]+>/g, "").trim()) {
      throw new Error("Couldn't find any readable text in that file. Make sure it's a valid .docx export.");
    }

    const chapters = splitIntoChapters(html);
    const wordCount = countWords(html);
    const authorName = book.author.displayName || book.author.name;

    // HTML chapters -> .epub buffer
    // version: 2 — epub-gen-memory's EPUB3 output declares the cover only via the legacy
    // <meta name="cover"> tag without the EPUB3 `properties="cover-image"` manifest
    // attribute, so Kindle's library thumbnail can't find it (the image still renders fine
    // inside the book). EPUB2's cover convention is exactly what it already writes, and we
    // don't use any EPUB3-only features, so EPUB2 output is the Kindle-compatible choice.
    const epubBuffer = await epub(
      { title: book.title, author: authorName, cover: book.coverImageUrl || undefined, version: 2 },
      chapters
    );

    const epubKey = `${authorId}/manuscripts/${bookId}/${Date.now()}-converted.epub`;
    await uploadToSupabaseStorage("book-files", epubKey, epubBuffer, "application/epub+zip");

    const epubFileName = fileName.replace(/\.docx$/i, ".epub");
    const done = await prisma.bookFormatJob.update({
      where: { id: job.id },
      data: {
        status: "DONE",
        chapterCount: chapters.length,
        wordCount,
        epubFileKey: epubKey,
        epubFileName,
      },
    });

    return NextResponse.json({ job: done });
  } catch (err: any) {
    const msg = err?.message ?? "Conversion failed. Please try again.";
    console.error("[format/convert] Error:", msg);
    const failed = await prisma.bookFormatJob.update({
      where: { id: job.id },
      data: { status: "FAILED", errorMessage: msg },
    });
    return NextResponse.json({ error: msg, job: failed }, { status: 500 });
  }
}
