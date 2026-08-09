import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/db";
import { requireSuperAdminId }       from "@/lib/super-admin-auth";
import { publishSocialPost }         from "@/lib/social/publisher";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const post = await prisma.socialPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (["PUBLISHING", "PUBLISHED"].includes(post.status)) {
    return NextResponse.json({ error: "Post is already published or being published." }, { status: 400 });
  }

  try {
    await publishSocialPost(id);
    const updated = await prisma.socialPost.findUnique({ where: { id }, include: { results: true } });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Publish failed" }, { status: 500 });
  }
}
