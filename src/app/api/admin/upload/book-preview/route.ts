import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PreviewMediaType } from "@prisma/client";

const LIMITS: Record<string, number> = {
  "image/jpeg": 5  * 1024 * 1024,
  "image/png":  5  * 1024 * 1024,
  "image/webp": 5  * 1024 * 1024,
  "image/gif":  5  * 1024 * 1024,
  "video/mp4":  50 * 1024 * 1024,
  "audio/mpeg": 20 * 1024 * 1024,
  "audio/mp3":  20 * 1024 * 1024,
};

function mediaTypeFromMime(mime: string): PreviewMediaType {
  if (mime.startsWith("video/")) return PreviewMediaType.VIDEO;
  if (mime.startsWith("audio/")) return PreviewMediaType.AUDIO;
  return PreviewMediaType.IMAGE;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart request" }, { status: 400 });
  }

  const bookId   = formData.get("bookId") as string | null;
  const position = parseInt(formData.get("position") as string ?? "0");
  const slot     = formData.get("slot") as "media" | "thumbnail" | null; // which file in the slot
  const file     = formData.get("file");

  if (!bookId || !position || position < 1 || position > 3 || !slot) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate mime type
  const maxBytes = LIMITS[file.type];
  if (!maxBytes) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: JPG, PNG, WebP, GIF, MP4, MP3" },
      { status: 400 }
    );
  }
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max ${maxBytes / 1024 / 1024} MB for this type.` },
      { status: 400 }
    );
  }

  // Poster/thumbnail slot must be an image
  if (slot === "thumbnail" && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Poster must be an image" }, { status: 400 });
  }

  // Verify book belongs to this author
  const book = await prisma.book.findFirst({
    where: { id: bookId, authorId: userId },
    select: { id: true },
  });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const ext         = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);
  const storagePath = `${userId}/previews/${bookId}/${position}-${slot}-${Date.now()}.${ext}`;

  const { uploadToSupabaseStorage } = await import("@/lib/supabase-storage");
  let fileUrl: string;
  try {
    fileUrl = await uploadToSupabaseStorage("book-previews", storagePath, buffer, file.type);
  } catch (err) {
    console.error("[upload/book-preview] Supabase error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  // Upsert the preview media record
  const existing = await prisma.bookPreviewMedia.findUnique({
    where: { bookId_position: { bookId, position } },
  });

  const mediaType = slot === "media" ? mediaTypeFromMime(file.type) : (existing?.mediaType ?? PreviewMediaType.IMAGE);

  const updateData = slot === "media"
    ? { fileUrl, fileKey: storagePath, mediaType }
    : { thumbnailUrl: fileUrl, thumbnailFileKey: storagePath };

  const record = existing
    ? await prisma.bookPreviewMedia.update({
        where: { bookId_position: { bookId, position } },
        data: updateData,
      })
    : await prisma.bookPreviewMedia.create({
        data: {
          bookId,
          position,
          mediaType,
          fileUrl:  slot === "media" ? fileUrl : "",
          fileKey:  slot === "media" ? storagePath : null,
          thumbnailUrl:     slot === "thumbnail" ? fileUrl : null,
          thumbnailFileKey: slot === "thumbnail" ? storagePath : null,
        },
      });

  return NextResponse.json({ url: fileUrl, fileKey: storagePath, record });
}
