import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// ─── GET /api/admin/specials ──────────────────────────────────────────────────
// List all specials for the logged-in author

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;

  const specials = await prisma.special.findMany({
    where: { authorId },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json({ specials });
}

// ─── POST /api/admin/specials ─────────────────────────────────────────────────
// Create a new special

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const body = await req.json();

  const { title, description, imageUrl, ctaLabel, ctaUrl, startsAt, endsAt, isActive } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Validate date range if both provided
  if (startsAt && endsAt && new Date(startsAt) >= new Date(endsAt)) {
    return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
  }

  const special = await prisma.special.create({
    data: {
      authorId,
      title: title.trim(),
      description: description?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      ctaLabel: ctaLabel?.trim() || null,
      ctaUrl: ctaUrl?.trim() || null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({ special }, { status: 201 });
}
