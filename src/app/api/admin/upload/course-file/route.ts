import { NextRequest, NextResponse } from "next/server";
import nodePath from "path";
import fs from "fs/promises";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/api-rate-limit";

// Max 50 MB — worksheets, slide decks, cheat sheets, not full ebooks/videos
const MAX_BYTES = 50 * 1024 * 1024;

const ALLOWED_EXT = new Set([
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "zip", "txt",
]);

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * POST /api/admin/upload/course-file
 *
 * Accepts multipart/form-data with: file — a downloadable resource for a course lesson
 * (worksheet, slide deck, cheat sheet). Unlike /api/admin/upload/book-file, this isn't
 * tied to an existing row — course lessons don't have ids until the course form is
 * submitted, so the fileKey/fileName travel in the lesson payload instead.
 *
 * Returns: { fileKey, fileName }
 * Stored in a PRIVATE Supabase bucket ("course-files") — only ever delivered via
 * short-lived signed URLs to enrolled readers.
 */
export async function POST(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const _rl = await enforceRateLimit(req, { bucket: "upload", maxRequests: 20, windowSeconds: 60, userId: authorId });
    if (_rl) return _rl;

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "The file could not be received. Please check your connection and try again." }, { status: 400 });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, Word, PowerPoint, Excel, ZIP, or text file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File must be 50 MB or smaller." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    let fileKey: string;

    if (SUPABASE_CONFIGURED) {
      const { uploadToSupabaseStorage } = await import("@/lib/supabase-storage");
      fileKey = `${authorId}/course-files/${safeName}`;

      try {
        await uploadToSupabaseStorage(
          "course-files",
          fileKey,
          buffer,
          file.type || "application/octet-stream"
        );
      } catch (err: any) {
        const detail = err?.message ?? String(err);
        console.error("[upload/course-file] Supabase error:", detail);

        if (detail.includes("404") || detail.includes("Bucket not found") || detail.includes("NoSuchBucket")) {
          return NextResponse.json(
            {
              error:
                'Supabase bucket "course-files" does not exist. Please create it in your Supabase dashboard ' +
                "(Storage → New bucket → name: course-files, Public: OFF — this must be a PRIVATE bucket).",
            },
            { status: 500 }
          );
        }
        if (detail.includes("403") || detail.includes("Unauthorized") || detail.includes("policy")) {
          return NextResponse.json(
            { error: 'Supabase Storage permission denied. Make sure your service role key has storage access for "course-files".' },
            { status: 500 }
          );
        }
        return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
      }
    } else {
      // ── Local filesystem fallback (development without Supabase) ───────────────
      const uploadsDir = nodePath.join(process.cwd(), "public", "uploads", "course-files");
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(nodePath.join(uploadsDir, safeName), buffer);
      fileKey = `/uploads/course-files/${safeName}`;
    }

    return NextResponse.json({ fileKey, fileName: file.name });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[upload/course-file] Unhandled error:", msg);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
