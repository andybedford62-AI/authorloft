import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import nodePath from "path";
import fs from "fs/promises";

const MAX_BYTES    = 10 * 1024 * 1024; // 10 MB — hero photos can be large
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

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

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG or WebP images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 10 MB or smaller" },
      { status: 400 }
    );
  }

  const ext         = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);

  let publicUrl: string;

  if (SUPABASE_CONFIGURED) {
    const { uploadToSupabaseStorage } = await import("@/lib/supabase-storage");
    const storagePath = `${authorId}/hero/${Date.now()}.${ext}`;
    try {
      publicUrl = await uploadToSupabaseStorage("book-covers", storagePath, buffer, file.type);
    } catch (err) {
      console.error("[upload/hero] Supabase error:", err);
      return NextResponse.json(
        { error: "Upload failed. Check your Supabase Storage configuration." },
        { status: 500 }
      );
    }
  } else {
    const uploadsDir = nodePath.join(process.cwd(), "public", "uploads", "hero");
    await fs.mkdir(uploadsDir, { recursive: true });
    const filename = `${authorId}-${Date.now()}.${ext}`;
    await fs.writeFile(nodePath.join(uploadsDir, filename), buffer);
    publicUrl = `/uploads/hero/${filename}`;
  }

  // Persist immediately so the live site updates right away
  await prisma.author.update({
    where: { id: authorId },
    data: { heroImageUrl: publicUrl },
  });

  return NextResponse.json({ url: publicUrl });
}
