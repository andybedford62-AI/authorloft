import { NextRequest, NextResponse } from "next/server";
import nodePath from "path";
import fs from "fs/promises";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg":  "jpg",
  "image/jpg":   "jpg",
  "image/png":   "png",
  "image/webp":  "webp",
  "image/gif":   "gif",
  "image/avif":  "avif",
};

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart request" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported format "${file.type}". Please upload JPG, PNG, WebP, or GIF.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Cover image must be 5 MB or smaller." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);
  const filename    = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  let publicUrl: string;
  let fileKey: string | null = null;

  if (SUPABASE_CONFIGURED) {
    const { uploadToSupabaseStorage } = await import("@/lib/supabase-storage");
    fileKey = `${authorId}/covers/${filename}`;
    try {
      publicUrl = await uploadToSupabaseStorage(
        "flip-book-covers",
        fileKey,
        buffer,
        file.type,
      );
    } catch (err: any) {
      const detail = err?.message ?? String(err);
      console.error("[upload/flip-book-cover] Supabase error:", detail);

      if (detail.includes("404") || detail.includes("Bucket not found") || detail.includes("NoSuchBucket")) {
        return NextResponse.json(
          { error: 'Supabase bucket "flip-book-covers" does not exist. Please create it in your Supabase dashboard (Storage → New bucket → name: flip-book-covers, Public: on).' },
          { status: 500 }
        );
      }
      if (detail.includes("403") || detail.includes("Unauthorized") || detail.includes("policy")) {
        return NextResponse.json(
          { error: 'Supabase Storage permission denied. Make sure the "flip-book-covers" bucket is set to Public and your service role key has storage access.' },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }
  } else {
    const uploadsDir = nodePath.join(process.cwd(), "public", "uploads", "flip-book-covers");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(nodePath.join(uploadsDir, filename), buffer);
    publicUrl = `/uploads/flip-book-covers/${filename}`;
    fileKey   = null;
  }

  return NextResponse.json({
    url:     publicUrl,
    fileKey,
    mimeType: file.type,
    originalName: file.name,
  });
}
