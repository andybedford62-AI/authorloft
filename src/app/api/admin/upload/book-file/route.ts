import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import nodePath from "path";
import fs from "fs/promises";

// Max 500 MB — large illustrated PDFs can be hefty
const MAX_BYTES = 500 * 1024 * 1024;

// Allowed MIME types for eBook delivery
const ALLOWED_MIME: Record<string, string> = {
  "application/pdf":             "pdf",
  "application/epub+zip":        "epub",
  "application/x-mobipocket-ebook": "mobi",
  "application/vnd.amazon.ebook": "mobi",
  // Some browsers report generic types
  "application/octet-stream":    "", // handled by filename extension fallback
  "application/zip":             "", // ePub is technically a zip
};

const EXT_MAP: Record<string, string> = {
  pdf: "pdf",
  epub: "epub",
  mobi: "mobi",
};

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * POST /api/admin/upload/book-file
 *
 * Accepts multipart/form-data with:
 *   file    — the PDF/ePub/MOBI file
 *   itemId  — the BookDirectSaleItem id this file belongs to
 *
 * Returns: { url, fileKey, fileName }
 *
 * Files are stored in a PRIVATE Supabase bucket ("book-files").
 * They are only delivered to buyers via short-lived signed URLs.
 */

// Tell Vercel/Next.js not to limit the request body size
export const config = {
  api: { bodyParser: false },
};

export async function POST(req: NextRequest) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const authorId = (session.user as any).id as string;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (e: any) {
    return NextResponse.json({ error: `Could not parse upload: ${e?.message ?? "invalid request"}` }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const itemId = formData.get("itemId");
  if (typeof itemId !== "string" || !itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  // Verify the sale item belongs to this author
  const saleItem = await prisma.bookDirectSaleItem.findFirst({
    where: { id: itemId, book: { authorId } },
    select: { id: true, fileKey: true },
  });
  if (!saleItem) {
    return NextResponse.json({ error: "Sale item not found" }, { status: 404 });
  }

  // Determine extension
  let ext = ALLOWED_MIME[file.type];
  if (ext === "" || ext === undefined) {
    const nameExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    ext = EXT_MAP[nameExt] ?? "";
  }
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported format "${file.type}". Please upload a PDF, ePub, or MOBI file.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be 500 MB or smaller." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  let publicUrl: string;
  let fileKey: string;

  if (SUPABASE_CONFIGURED) {
    // ── Supabase Storage (PRIVATE bucket) ──────────────────────────────────────
    const { uploadToSupabaseStorage, deleteFromSupabaseStorage } = await import(
      "@/lib/supabase-storage"
    );

    fileKey = `${authorId}/book-files/${itemId}/${safeName}`;

    try {
      publicUrl = await uploadToSupabaseStorage(
        "book-files",
        fileKey,
        buffer,
        file.type || `application/${ext}`
      );
    } catch (err: any) {
      const detail = err?.message ?? String(err);
      console.error("[upload/book-file] Supabase error:", detail);

      if (detail.includes("404") || detail.includes("Bucket not found") || detail.includes("NoSuchBucket")) {
        return NextResponse.json(
          {
            error:
              'Supabase bucket "book-files" does not exist. Please create it in your Supabase dashboard ' +
              "(Storage → New bucket → name: book-files, Public: OFF — this must be a PRIVATE bucket).",
          },
          { status: 500 }
        );
      }
      if (detail.includes("403") || detail.includes("Unauthorized") || detail.includes("policy")) {
        return NextResponse.json(
          {
            error:
              'Supabase Storage permission denied. Make sure your service role key has storage access for "book-files".',
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: `Upload failed: ${detail}` }, { status: 500 });
    }

    // Delete the OLD file if one existed (avoid orphaned files in storage)
    if (saleItem.fileKey && saleItem.fileKey !== fileKey) {
      deleteFromSupabaseStorage("book-files", saleItem.fileKey).catch((e) =>
        console.error("[upload/book-file] Failed to delete old file:", e)
      );
    }
  } else {
    // ── Local filesystem fallback (development without Supabase) ───────────────
    const uploadsDir = nodePath.join(process.cwd(), "public", "uploads", "book-files");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(nodePath.join(uploadsDir, safeName), buffer);
    publicUrl = `/uploads/book-files/${safeName}`;
    fileKey = publicUrl;
  }

  // Persist fileUrl + fileKey + fileName on the sale item
  await prisma.bookDirectSaleItem.update({
    where: { id: itemId },
    data: { fileUrl: publicUrl, fileKey, fileName: file.name },
  });

  return NextResponse.json({
    url: publicUrl,
    fileKey,
    fileName: file.name,
  });

  } catch (err: any) {
    // Top-level catch — surface the real error instead of returning a blank 500
    const msg = err?.message ?? String(err);
    console.error("[upload/book-file] Unhandled error:", msg);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
