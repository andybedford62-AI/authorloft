import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodePath from "path";
import fs from "fs/promises";

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

const ALLOWED_MIME: Record<string, string> = {
  // MP3
  "audio/mpeg":       "mp3",
  "audio/mp3":        "mp3",
  // MP4 / M4A — browsers and OS report these inconsistently
  "audio/mp4":        "m4a",
  "audio/x-m4a":      "m4a",
  "audio/m4a":        "m4a",
  "video/mp4":        "mp4",   // .mp4 audio files often report as video/mp4
  "video/mpeg":       "mp4",
  // WAV
  "audio/wav":        "wav",
  "audio/x-wav":      "wav",
  "audio/wave":       "wav",
  "audio/vnd.wave":   "wav",
  // OGG / FLAC / AAC
  "audio/ogg":        "ogg",
  "audio/flac":       "flac",
  "audio/x-flac":     "flac",
  "audio/aac":        "aac",
  "audio/x-aac":      "aac",
  // Generic fallback — some browsers send this for any audio
  "application/octet-stream": "",  // handled separately below
};

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const authorId = (session.user as any).id as string;

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

  // Derive extension — fall back to file name extension for octet-stream uploads
  let ext = ALLOWED_MIME[file.type];
  if (ext === "" || ext === undefined) {
    // Try to infer from the filename
    const nameExt = file.name.split(".").pop()?.toLowerCase() ?? "";
    const nameExtMap: Record<string, string> = {
      mp3: "mp3", mp4: "mp4", m4a: "m4a", wav: "wav",
      ogg: "ogg", flac: "flac", aac: "aac",
    };
    ext = nameExtMap[nameExt] ?? "";
  }
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported format "${file.type}". Please upload MP3, MP4, M4A, WAV, OGG, FLAC, or AAC.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Audio file must be 100 MB or smaller." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);
  const filename    = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  let publicUrl: string;
  let fileKey: string | null = null;

  if (SUPABASE_CONFIGURED) {
    // ── Supabase Storage ─────────────────────────────────────────────────────
    const { uploadToSupabaseStorage } = await import("@/lib/supabase-storage");
    fileKey = `${authorId}/audio/${filename}`;
    try {
      publicUrl = await uploadToSupabaseStorage(
        "book-audio",
        fileKey,
        buffer,
        file.type || `audio/${ext}`,
      );
    } catch (err: any) {
      const detail = err?.message ?? String(err);
      console.error("[upload/audio] Supabase error:", detail);

      // Give the author a specific, actionable message
      if (detail.includes("404") || detail.includes("Bucket not found") || detail.includes("NoSuchBucket")) {
        return NextResponse.json(
          { error: 'Supabase bucket "book-audio" does not exist. Please create it in your Supabase dashboard (Storage → New bucket → name: book-audio, Public: on).' },
          { status: 500 }
        );
      }
      if (detail.includes("403") || detail.includes("Unauthorized") || detail.includes("policy")) {
        return NextResponse.json(
          { error: "Supabase Storage permission denied. Make sure the \"book-audio\" bucket is set to Public and your service role key has storage access." },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Upload failed: ${detail}` },
        { status: 500 }
      );
    }
  } else {
    // ── Local filesystem fallback (development) ───────────────────────────────
    const uploadsDir = nodePath.join(process.cwd(), "public", "uploads", "audio");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(nodePath.join(uploadsDir, filename), buffer);
    publicUrl = `/uploads/audio/${filename}`;
    fileKey   = null; // no Supabase key needed for local
  }

  return NextResponse.json({
    url:      publicUrl,
    fileKey,
    mimeType: file.type,
    originalName: file.name,
  });
}
