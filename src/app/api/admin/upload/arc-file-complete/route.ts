import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromSupabaseStorage } from "@/lib/supabase-storage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function POST(req: NextRequest) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { bookId, fileKey, fileName, arcCopyId } = body;

    if (!bookId || !fileKey || !fileName) {
      return NextResponse.json({ error: "bookId, fileKey, and fileName are required" }, { status: 400 });
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, authorId },
      select: { id: true },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/arc-files/${fileKey}`;

    if (arcCopyId) {
      // Update existing ArcCopy — delete old file first
      const existing = await prisma.arcCopy.findFirst({
        where: { id: arcCopyId, bookId },
        select: { fileKey: true },
      });
      if (existing?.fileKey) {
        await deleteFromSupabaseStorage("arc-files", existing.fileKey).catch(() => {});
      }
      const updated = await prisma.arcCopy.update({
        where: { id: arcCopyId },
        data: { fileUrl, fileKey, fileName, isActive: true },
      });
      return NextResponse.json(updated);
    }

    // Deactivate any existing active copy for this book
    await prisma.arcCopy.updateMany({
      where: { bookId, isActive: true },
      data: { isActive: false },
    });

    const arcCopy = await prisma.arcCopy.create({
      data: { bookId, fileUrl, fileKey, fileName },
    });

    return NextResponse.json(arcCopy);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[upload/arc-file-complete] Error:", msg);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
