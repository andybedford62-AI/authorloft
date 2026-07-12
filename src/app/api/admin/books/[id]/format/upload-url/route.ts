import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseUploadUrl } from "@/lib/supabase-storage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/api-rate-limit";

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB — generous for a manuscript

/**
 * POST /api/admin/books/[id]/format/upload-url
 *
 * Step 1 of the DOCX → ePub Auto-Formatter upload flow.
 * Returns a signed upload URL so the browser can PUT the manuscript directly
 * to Supabase Storage, bypassing Vercel's body size limit.
 *
 * Body: { fileName, fileSize }
 * Returns: { signedUrl, fileKey }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const _rl = await enforceRateLimit(req, { bucket: "auto-format", maxRequests: 5, windowSeconds: 60, userId: authorId });
    if (_rl) return _rl;

    const { id: bookId } = await params;
    const book = await prisma.book.findFirst({ where: { id: bookId, authorId } });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const body = await req.json();
    const { fileName, fileSize } = body;

    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (ext !== "docx") {
      return NextResponse.json({ error: "Please upload a .docx file." }, { status: 400 });
    }
    if (typeof fileSize === "number" && fileSize > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File is too large. Manuscripts must be under 25 MB." }, { status: 400 });
    }

    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.docx`;
    const fileKey = `${authorId}/manuscripts/${bookId}/${safeName}`;

    const { signedUrl } = await getSupabaseUploadUrl("book-files", fileKey);

    return NextResponse.json({ signedUrl, fileKey });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[format/upload-url] Error:", msg);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
