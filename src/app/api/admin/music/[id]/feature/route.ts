import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

/**
 * Lightweight "just toggle isFeatured" endpoint for the admin list page's
 * star button. The full PATCH /api/admin/music/[id] route defaults `tracks`
 * to an empty array when absent and replaces every lesson row wholesale —
 * calling it with a single-field body would silently delete every track.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.course.findFirst({ where: { id, authorId, kind: "MUSIC" } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const isFeatured = body?.isFeatured === true;

  const list = await prisma.$transaction(async (tx) => {
    // Only one music list may be featured at a time — see the same guard on the full update route.
    if (isFeatured) {
      await tx.course.updateMany({
        where: { authorId, kind: "MUSIC", id: { not: id }, isFeatured: true },
        data: { isFeatured: false },
      });
    }
    return tx.course.update({ where: { id }, data: { isFeatured } });
  });

  return NextResponse.json({ isFeatured: list.isFeatured });
}
