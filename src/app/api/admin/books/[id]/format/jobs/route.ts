import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// ── GET — list this book's Auto-Formatter conversion jobs, newest first ───────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;
  const book = await prisma.book.findFirst({ where: { id: bookId, authorId } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

  const jobs = await prisma.bookFormatJob.findMany({
    where: { bookId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ jobs });
}
