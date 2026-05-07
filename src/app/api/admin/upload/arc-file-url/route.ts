import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseUploadUrl } from "@/lib/supabase-storage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const ALLOWED_EXTENSIONS = new Set(["pdf", "epub", "mobi"]);

export async function POST(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { bookId, fileName } = body;

    if (!bookId || typeof bookId !== "string") {
      return NextResponse.json({ error: "bookId is required" }, { status: 400 });
    }
    if (!fileName || typeof fileName !== "string") {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type ".${ext}". Please upload a PDF, ePub, or MOBI file.` },
        { status: 400 }
      );
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, authorId },
      select: { id: true },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileKey = `${authorId}/arc-files/${bookId}/${safeName}`;

    const { signedUrl } = await getSupabaseUploadUrl("arc-files", fileKey);

    return NextResponse.json({ signedUrl, fileKey, path: fileKey });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload/arc-file-url] Error:", msg);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
