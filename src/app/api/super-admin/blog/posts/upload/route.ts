import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP, or GIF images are allowed." }, { status: 400 });
  }

  const ext     = file.type.split("/")[1].replace("jpeg", "jpg");
  const fileKey = `blog/cover-${Date.now()}.${ext}`;
  const buffer  = Buffer.from(await file.arrayBuffer());

  try {
    const publicUrl = await uploadToSupabaseStorage("book-covers", fileKey, buffer, file.type);
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
