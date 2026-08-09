import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/db";
import { requireSuperAdminId }       from "@/lib/super-admin-auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const post = await prisma.socialPost.findUnique({
    where:   { id },
    include: { results: true },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(post);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.socialPost.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only allow editing DRAFT or SCHEDULED posts
  if (!["DRAFT", "SCHEDULED"].includes(existing.status)) {
    return NextResponse.json({ error: "Only DRAFT or SCHEDULED posts can be edited." }, { status: 400 });
  }

  const { caption, mediaUrl, mediaType, platforms, scheduledAt } = await req.json();

  if (caption !== undefined && !caption?.trim()) {
    return NextResponse.json({ error: "Caption cannot be empty." }, { status: 400 });
  }

  const newPlatforms = platforms ?? existing.platforms;
  if (newPlatforms.includes("INSTAGRAM") && !(mediaUrl ?? existing.mediaUrl)) {
    return NextResponse.json({ error: "Instagram requires an image." }, { status: 400 });
  }

  const status = scheduledAt ? "SCHEDULED" : "DRAFT";

  const updated = await prisma.socialPost.update({
    where: { id },
    data: {
      ...(caption    !== undefined && { caption: caption.trim() }),
      ...(mediaUrl   !== undefined && { mediaUrl: mediaUrl || null }),
      ...(mediaType  !== undefined && { mediaType: mediaType || null }),
      ...(platforms  !== undefined && { platforms }),
      ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
      status,
    },
    include: { results: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    await prisma.socialPost.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
