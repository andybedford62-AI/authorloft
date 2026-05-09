import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseUploadUrl } from "@/lib/supabase-storage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const EXT_TO_FORMAT: Record<string, string> = {
  pdf:  "PDF",
  epub: "EPUB",
  mobi: "MOBI",
  azw3: "AZW3",
};

export async function POST(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { arcId, bookId, fileName } = body;

    if (!arcId || !bookId || !fileName) {
      return NextResponse.json({ error: "arcId, bookId, and fileName are required" }, { status: 400 });
    }

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    const format = EXT_TO_FORMAT[ext];
    if (!format) {
      return NextResponse.json(
        { error: `Unsupported file type ".${ext}". Please upload PDF, EPUB, MOBI, or AZW3.` },
        { status: 400 }
      );
    }

    // Verify ARC belongs to this author
    const arc = await prisma.arcCopy.findFirst({
      where: { id: arcId, bookId, book: { authorId } },
      select: { id: true },
    });
    if (!arc) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const fileKey = `${authorId}/arc/${arcId}/${safeName}`;

    const { signedUrl } = await getSupabaseUploadUrl("book-files", fileKey);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const fileUrl = `${supabaseUrl}/storage/v1/object/book-files/${fileKey}`;

    return NextResponse.json({ signedUrl, fileKey, fileUrl, format });
  } catch (err: any) {
    console.error("[upload/arc-file-url] Error:", err?.message ?? err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
