import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/db";
import { requireSuperAdminId }       from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await prisma.socialPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { results: { select: { platform: true, status: true, platformPostId: true, error: true, publishedAt: true } } },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { caption, mediaUrl, mediaType, platforms, scheduledAt } = await req.json();

  if (!caption?.trim()) {
    return NextResponse.json({ error: "Caption is required." }, { status: 400 });
  }
  if (!Array.isArray(platforms) || platforms.length === 0) {
    return NextResponse.json({ error: "At least one platform must be selected." }, { status: 400 });
  }

  const validPlatforms = ["LINKEDIN", "FACEBOOK", "INSTAGRAM", "TWITTER"];
  const invalid = platforms.filter((p: string) => !validPlatforms.includes(p));
  if (invalid.length > 0) {
    return NextResponse.json({ error: `Invalid platforms: ${invalid.join(", ")}` }, { status: 400 });
  }

  // Instagram requires an image
  if (platforms.includes("INSTAGRAM") && !mediaUrl) {
    return NextResponse.json({ error: "Instagram requires an image. Please upload one before selecting Instagram." }, { status: 400 });
  }

  const status      = scheduledAt ? "SCHEDULED" : "DRAFT";
  const scheduledAt_ = scheduledAt ? new Date(scheduledAt) : null;

  const post = await prisma.socialPost.create({
    data: {
      caption:    caption.trim(),
      mediaUrl:   mediaUrl   || null,
      mediaType:  mediaType  || null,
      platforms,
      status,
      scheduledAt: scheduledAt_,
    },
    include: { results: true },
  });

  return NextResponse.json(post, { status: 201 });
}
