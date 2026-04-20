import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// GET /api/admin/books/[id]/audio
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;

  // Verify book belongs to this author
  const book = await prisma.book.findFirst({ where: { id: bookId, authorId }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const tracks = await prisma.bookAudioTrack.findMany({
    where: { bookId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(tracks);
}

// POST /api/admin/books/[id]/audio
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: bookId } = await params;

  // Verify plan allows audio
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { plan: { select: { audioEnabled: true } } },
  });
  if (!author?.plan?.audioEnabled) {
    return NextResponse.json(
      { error: "Audio previews require a Standard or Premium plan." },
      { status: 403 }
    );
  }

  // Verify book belongs to this author
  const book = await prisma.book.findFirst({ where: { id: bookId, authorId }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, url, fileKey, mimeType, durationSeconds } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Track title is required." }, { status: 400 });
  }
  if (!url?.trim()) {
    return NextResponse.json({ error: "Audio URL is required." }, { status: 400 });
  }

  // Assign next sort order
  const maxOrder = await prisma.bookAudioTrack.aggregate({
    where: { bookId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const track = await prisma.bookAudioTrack.create({
    data: {
      bookId,
      title:           title.trim(),
      description:     description?.trim() || null,
      url:             url.trim(),
      fileKey:         fileKey || null,
      mimeType:        mimeType || null,
      durationSeconds: durationSeconds ? parseInt(durationSeconds) : null,
      sortOrder,
    },
  });

  return NextResponse.json(track, { status: 201 });
}
