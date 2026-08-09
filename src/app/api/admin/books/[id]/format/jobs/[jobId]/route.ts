import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { deleteFromSupabaseStorage } from "@/lib/supabase-storage";

// ── DELETE — remove a past conversion job and its stored files ────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, jobId } = await params;
  const job = await prisma.bookFormatJob.findFirst({ where: { id: jobId, bookId, authorId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fire-and-forget storage cleanup — don't block the response on it
  if (job.sourceFileKey) {
    deleteFromSupabaseStorage("book-files", job.sourceFileKey).catch((e) =>
      console.error("[format/jobs delete] Failed to delete source file:", e)
    );
  }
  if (job.epubFileKey) {
    deleteFromSupabaseStorage("book-files", job.epubFileKey).catch((e) =>
      console.error("[format/jobs delete] Failed to delete epub file:", e)
    );
  }

  await prisma.bookFormatJob.delete({ where: { id: jobId } });
  return NextResponse.json({ ok: true });
}
