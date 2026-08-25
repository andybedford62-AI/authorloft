import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PreviewMediaType } from "@prisma/client";
import { deleteFromSupabaseStorage } from "@/lib/supabase-storage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/api-rate-limit";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * POST /api/admin/upload/book-preview-complete
 *
 * Step 2 of direct browser → Supabase upload. Called once the browser has PUT
 * the file to the signed URL from book-preview-url; records the row.
 *
 * Body: { bookId, position, slot, fileKey }
 * Returns: { record }
 */
function mediaTypeFromExt(ext: string): PreviewMediaType {
  if (["mp4", "mov"].includes(ext)) return PreviewMediaType.VIDEO;
  if (["mp3"].includes(ext)) return PreviewMediaType.AUDIO;
  return PreviewMediaType.IMAGE;
}

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
    const fileKey = typeof body?.fileKey === "string" ? body.fileKey : "";

    if (!bookId || !slot || !fileKey || !Number.isInteger(position) || position < 1 || position > 3) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    // Scoped to this author — stops one author attaching another's object.
    if (!fileKey.startsWith(`${authorId}/previews/${bookId}/`)) {
      return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, authorId },
      select: { id: true },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/book-previews/${fileKey}`;
    const ext = fileKey.split(".").pop()?.toLowerCase() ?? "";

    const existing = await prisma.bookPreviewMedia.findUnique({
      where: { bookId_position: { bookId, position } },
    });

    // Replacing a file leaves the old object orphaned in the bucket otherwise.
    const previousKey = slot === "media" ? existing?.fileKey : existing?.thumbnailFileKey;
    if (previousKey && previousKey !== fileKey) {
      deleteFromSupabaseStorage("book-previews", previousKey).catch((e) =>
        console.error("[book-preview-complete] Failed to delete replaced file:", e)
      );
    }

    const mediaType =
      slot === "media" ? mediaTypeFromExt(ext) : (existing?.mediaType ?? PreviewMediaType.IMAGE);

    const record = existing
      ? await prisma.bookPreviewMedia.update({
          where: { bookId_position: { bookId, position } },
          data:
            slot === "media"
              ? { fileUrl, fileKey, mediaType }
              : { thumbnailUrl: fileUrl, thumbnailFileKey: fileKey },
        })
      : await prisma.bookPreviewMedia.create({
          data: {
            bookId,
            position,
            mediaType,
            fileUrl: slot === "media" ? fileUrl : "",
            fileKey: slot === "media" ? fileKey : null,
            thumbnailUrl: slot === "thumbnail" ? fileUrl : null,
            thumbnailFileKey: slot === "thumbnail" ? fileKey : null,
          },
        });

    return NextResponse.json({ url: fileUrl, fileKey, record });
  } catch (err) {
    console.error("[upload/book-preview-complete] error:", err);
    return NextResponse.json({ error: "Could not finish the upload." }, { status: 500 });
  }
}
