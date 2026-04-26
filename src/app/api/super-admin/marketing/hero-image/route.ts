import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadToSupabaseStorage } from "@/lib/supabase-storage";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const author = await prisma.author.findUnique({
    where:  { id: (session.user as any).id },
    select: { isSuperAdmin: true },
  });
  return author?.isSuperAdmin ? session : null;
}

/** GET — returns the current hero image URL */
export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await prisma.platformSettings.upsert({
    where:  { id: "singleton" },
    create: { id: "singleton" },
    update: {},
    select: { marketingHeroImageUrl: true },
  });

  return NextResponse.json({ url: settings.marketingHeroImageUrl ?? null });
}

/** PATCH — update via URL string */
export async function PATCH(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { url } = await req.json();

  await prisma.platformSettings.upsert({
    where:  { id: "singleton" },
    create: { id: "singleton", marketingHeroImageUrl: url || null },
    update: { marketingHeroImageUrl: url || null },
  });

  return NextResponse.json({ ok: true, url: url || null });
}

/** POST — upload a file directly */
export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

  const ext      = file.type.split("/")[1].replace("jpeg", "jpg");
  const fileKey  = `marketing/hero-${Date.now()}.${ext}`;
  const buffer   = Buffer.from(await file.arrayBuffer());

  try {
    const publicUrl = await uploadToSupabaseStorage("book-covers", fileKey, buffer, file.type);

    await prisma.platformSettings.upsert({
      where:  { id: "singleton" },
      create: { id: "singleton", marketingHeroImageUrl: publicUrl },
      update: { marketingHeroImageUrl: publicUrl },
    });

    return NextResponse.json({ ok: true, url: publicUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
