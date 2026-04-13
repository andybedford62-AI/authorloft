import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import nodePath from "path";
import fs from "fs/promises";

const MAX_BYTES    = 5 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
      { error: "Only JPEG, PNG, WebP and GIF images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller" },
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
    const storagePath = `${session.user.id}/profiles/${Date.now()}.${ext}`;
    try {
      publicUrl = await uploadToSupabaseStorage("book-covers", storagePath, buffer, file.type);
    } catch (err) {
      console.error("[upload/profile] Supabase error:", err);
      return NextResponse.json(
        { error: "Upload failed. Check your Supabase Storage configuration." },
        { status: 500 }
      );
    }
  } else {
    // ── Local filesystem fallback (development, no Supabase needed) ──────────
    // Saves to /public/uploads/profiles/ and serves as a static asset URL.
    const uploadsDir = nodePath.join(process.cwd(), "public", "uploads", "profiles");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    await fs.writeFile(nodePath.join(uploadsDir, filename), buffer);
    publicUrl = `/uploads/profiles/${filename}`;
  }

  // Immediately persist the URL so the live site reflects the change
  await prisma.author.update({
    where: { id: session.user.id },
    data: { profileImageUrl: publicUrl },
  });

  return NextResponse.json({ url: publicUrl });
}
