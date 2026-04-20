import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromSupabaseStorage } from "@/lib/supabase-storage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * POST /api/admin/upload/book-file-complete
 *
 * Step 2 of direct browser → Supabase upload.
 * Called after the browser has successfully uploaded the file directly to Supabase.
 * Records fileKey, fileUrl, and fileName on the BookDirectSaleItem.
 *
 * Body: { itemId, fileKey, fileName }
 * Returns: { ok: true, fileUrl, fileKey, fileName }
 */
export async function POST(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { itemId, fileKey, fileName } = body;

    if (!itemId || !fileKey || !fileName) {
      return NextResponse.json({ error: "itemId, fileKey, and fileName are required" }, { status: 400 });
    }

    // Verify the sale item belongs to this author
    const saleItem = await prisma.bookDirectSaleItem.findFirst({
      where: { id: itemId, book: { authorId } },
      select: { id: true, fileKey: true },
    });
    if (!saleItem) {
      return NextResponse.json({ error: "Sale item not found" }, { status: 404 });
    }

    // Delete old file from storage if it existed
    if (saleItem.fileKey && saleItem.fileKey !== fileKey) {
      deleteFromSupabaseStorage("book-files", saleItem.fileKey).catch((e) =>
        console.error("[book-file-complete] Failed to delete old file:", e)
      );
    }

    // The file is in a private bucket — we store the key; signed URLs are generated at download time
    const fileUrl = `${SUPABASE_URL}/storage/v1/object/book-files/${fileKey}`;

    await prisma.bookDirectSaleItem.update({
      where: { id: itemId },
      data: { fileUrl, fileKey, fileName },
    });

    return NextResponse.json({ ok: true, fileUrl, fileKey, fileName });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[upload/book-file-complete] Error:", msg);
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 });
  }
}
