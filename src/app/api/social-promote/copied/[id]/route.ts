import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

/** Author marks one of their own generations as copied. Drives the copy-rate success metric. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.generatedSocialPost.findUnique({
    where:  { id },
    select: { id: true, authorId: true, wasCopied: true },
  });
  if (!post || post.authorId !== authorId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (post.wasCopied) return NextResponse.json({ ok: true, alreadyMarked: true });

  await prisma.generatedSocialPost.update({
    where: { id },
    data:  { wasCopied: true, copiedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
