import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// PUT /api/admin/music/reorder
// Body: { orderedIds: string[] }  — full ordered list of music list (Course) IDs
export async function PUT(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderedIds } = await req.json();

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
  }

  // Verify all IDs belong to this author's music lists before updating
  const lists = await prisma.course.findMany({
    where: { authorId, kind: "MUSIC", id: { in: orderedIds } },
    select: { id: true },
  });

  const validIds = new Set(lists.map((l) => l.id));
  const updates = orderedIds
    .filter((id) => validIds.has(id))
    .map((id, index) =>
      prisma.course.update({ where: { id }, data: { displayOrder: index } })
    );

  await prisma.$transaction(updates);

  return NextResponse.json({ ok: true });
}
