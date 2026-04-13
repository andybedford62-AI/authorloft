import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodePath from "path";
import fs from "fs/promises";

const MAX_BYTES    = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, GIF and SVG images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 8 MB or smaller" },
      { status: 400 }
    );
  }

  const ext         = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);

  let publicUrl: string;

  if (SUPABASE_CONFIGURED) {
    // ── Supabase Storage (production) ────────────────────────────────────────
    const { uploadToSupabaseStorage } = await import("@/lib/supabase-storage");
    const storagePath = `${session.user.id}/blog-images/${Date.now()}.${ext}`;
    try {
      // Reuse the existing "book-covers" bucket (same bucket, different subfolder)
      publicUrl = await uploadToSupabaseStorage("book-covers", storagePath, buffer, file.type);
    } catch (err) {
      console.error("[upload/image] Supabase error:", err);
      return NextResponse.json(
        { error: "Upload failed. Check your Supabase Storage configuration." },
        { status: 500 }
      );
    }
  } else {
    // ── Local filesystem fallback (development) ───────────────────────────────
    const uploadsDir = nodePath.join(process.cwd(), "public", "uploads", "blog-images");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    await fs.writeFile(nodePath.join(uploadsDir, filename), buffer);
    publicUrl = `/uploads/blog-images/${filename}`;
  }

  return NextResponse.json({ url: publicUrl });
}
