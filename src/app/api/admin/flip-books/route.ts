import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAddFlipBook } from "@/lib/plan-limits";

// ─── GET /api/admin/flip-books ────────────────────────────────────────────────
// List all flip books for the logged-in author

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;

  const [flipBooks, planInfo] = await Promise.all([
    prisma.flipBook.findMany({
      where: { authorId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    canAddFlipBook(authorId),
  ]);

  return NextResponse.json({ flipBooks, planInfo });
}

// ─── POST /api/admin/flip-books ───────────────────────────────────────────────
// Create a new flip book

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;

  // Check plan limit
  const planCheck = await canAddFlipBook(authorId);
  if (!planCheck.allowed) {
    return NextResponse.json({ error: planCheck.reason }, { status: 403 });
  }

  const body = await req.json();
  const { title, subtitle, description, slug, flipBookUrl, coverImageUrl, coverImageKey, isActive, sortOrder } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!slug?.trim()) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  // Ensure slug is unique for this author
  const existing = await prisma.flipBook.findFirst({
    where: { authorId, slug: slug.trim() },
  });
  if (existing) {
    return NextResponse.json({ error: "A flip book with this slug already exists" }, { status: 409 });
  }

  const flipBook = await prisma.flipBook.create({
    data: {
      authorId,
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      description: description?.trim() || null,
      slug: slug.trim(),
      flipBookUrl: flipBookUrl?.trim() || null,
      coverImageUrl: coverImageUrl?.trim() || null,
      coverImageKey: coverImageKey?.trim() || null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });

  return NextResponse.json({ flipBook }, { status: 201 });
}
