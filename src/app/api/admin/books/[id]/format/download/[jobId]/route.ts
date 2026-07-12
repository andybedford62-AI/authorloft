import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { getSupabaseSignedUrl } from "@/lib/supabase-storage";

// ── GET — redirect to a short-lived signed URL for the converted .epub ────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId, jobId } = await params;
  const job = await prisma.bookFormatJob.findFirst({
    where: { id: jobId, bookId, authorId },
  });
  if (!job || job.status !== "DONE" || !job.epubFileKey) {
    return NextResponse.json({ error: "No converted file found" }, { status: 404 });
  }

  const signedUrl = await getSupabaseSignedUrl("book-files", job.epubFileKey, 300, job.epubFileName ?? undefined);
  return NextResponse.redirect(signedUrl);
}
