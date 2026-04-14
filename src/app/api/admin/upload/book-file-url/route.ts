import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSupabaseUploadUrl } from "@/lib/supabase-storage";

const ALLOWED_EXTENSIONS = new Set(["pdf", "epub", "mobi"]);

/**
 * POST /api/admin/upload/book-file-url
 *
 * Step 1 of direct browser → Supabase upload.
 * Returns a signed upload URL so the browser can PUT the file directly to
 * Supabase Storage — completely bypassing Vercel's 4.5 MB body limit.
 *
 * Body: { itemId, fileName }
 * Returns: { signedUrl, fileKey, path }
 *
 * After the browser uploads the file, call POST /api/admin/upload/book-file-complete
 * to record the fileKey in the database.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const authorId = (session.user as any).id as string;

    const body = await req.json();
    const { itemId, fileName } = body;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }
    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    // Check file extension
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type ".${ext}". Please upload a PDF, ePub, or MOBI file.` },
        { status: 400 }
      );
    }

    // Verify the sale item belongs to this author
    const saleItem = await prisma.bookDirectSaleItem.findFirst({
      where: { id: itemId, book: { authorId } },
      select: { id: true, fileKey: true },
    });
    if (!saleItem) {
      return NextResponse.json({ error: "Sale item not found" }, { status: 404 });
    }

    // Build the storage path
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileKey = `${authorId}/book-files/${itemId}/${safeName}`;

    // Get a signed upload URL from Supabase
    const { signedUrl } = await getSupabaseUploadUrl("book-files", fileKey);

    return NextResponse.json({ signedUrl, fileKey, path: fileKey });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[upload/book-file-url] Error:", msg);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
