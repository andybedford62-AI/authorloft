import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseUploadUrl } from "@/lib/supabase-storage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { PREVIEW_MEDIA_EXTENSIONS } from "@/lib/preview-media-limits";

/**
 * POST /api/admin/upload/book-preview-url
 *
 * Step 1 of direct browser → Supabase upload for book preview media.
 *
 * The original /api/admin/upload/book-preview took the file as a multipart POST
 * through a Vercel function, which caps request bodies at 4.5 MB. Its own limit
 * table advertised 50 MB for MP4, so every video large enough to be worth
 * uploading was rejected by the platform with a plain-text "Request Entity Too
 * Large" — which the client then tried to parse as JSON. Same two-step pattern
 * as book-file-url: the browser PUTs straight to Supabase and never sends the
 * bytes through us.
 *
 * Body: { bookId, position, slot, fileName }
 * Returns: { signedUrl, fileKey }
 */
export async function POST(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const _rl = await enforceRateLimit(req, { bucket: "upload", maxRequests: 20, windowSeconds: 60, userId: authorId });
    if (_rl) return _rl;

    const body = await req.json().catch(() => null);
    const bookId = typeof body?.bookId === "string" ? body.bookId : "";
    const position = Number(body?.position);
    const slot = body?.slot === "media" || body?.slot === "thumbnail" ? body.slot : null;
    const fileName = typeof body?.fileName === "string" ? body.fileName : "";

    if (!bookId || !slot || !fileName || !Number.isInteger(position) || position < 1 || position > 3) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (!(PREVIEW_MEDIA_EXTENSIONS as readonly string[]).includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type ".${ext}". Allowed: ${PREVIEW_MEDIA_EXTENSIONS.join(", ")}` },
        { status: 400 }
      );
    }
    // The poster frame is always an image, whatever the media itself is.
    if (slot === "thumbnail" && !["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      return NextResponse.json({ error: "The poster image must be a JPG, PNG, WebP or GIF." }, { status: 400 });
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, authorId },
      select: { id: true },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    // Author-scoped prefix — book-preview-complete refuses any key outside it.
    const fileKey = `${authorId}/previews/${bookId}/${position}-${slot}-${Date.now()}.${ext}`;
    const { signedUrl } = await getSupabaseUploadUrl("book-previews", fileKey);

    return NextResponse.json({ signedUrl, fileKey });
  } catch (err) {
    console.error("[upload/book-preview-url] error:", err);
    return NextResponse.json({ error: "Could not start the upload." }, { status: 500 });
  }
}
