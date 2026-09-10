import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { prisma } from "@/lib/db";
import { uploadToSupabaseStorage, ONE_YEAR_CACHE } from "@/lib/supabase-storage";
import { optimizeImageForWeb } from "@/lib/image-processing";
import { revalidatePath } from "next/cache";
import { SEO_PAGES } from "@/lib/seo-config";

const validPageIds = SEO_PAGES.map(p => p.id);

// POST /api/super-admin/seo/[page]/upload — upload OG image file
export async function POST(req: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { page } = await params;
  if (!validPageIds.includes(page as any)) return NextResponse.json({ error: "Unknown page." }, { status: 400 });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, or WebP images are allowed." }, { status: 400 });
  }

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
  }

  // convertFormat: false — OG images are fetched by social crawlers (Facebook, Twitter/X)
  // that don't reliably render WebP, so keep the original JPEG/PNG, just resized/recompressed.
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const { buffer, contentType, ext } = await optimizeImageForWeb(rawBuffer, file.type, {
    maxDimension: 2400,
    convertFormat: false,
  });
  const fileKey = `seo/og-${page}-${Date.now()}.${ext}`;

  try {
    const publicUrl = await uploadToSupabaseStorage("book-covers", fileKey, buffer, contentType, ONE_YEAR_CACHE);
    const pageInfo  = SEO_PAGES.find(p => p.id === page)!;

    await prisma.seoConfig.upsert({
      where:  { id: page },
      create: { id: page, ogImageUrl: publicUrl },
      update: { ogImageUrl: publicUrl },
    });

    revalidatePath(pageInfo.path);
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
