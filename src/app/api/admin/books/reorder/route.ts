import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// PUT /api/admin/books/reorder
// Body: { orderedIds: string[] }  — full ordered list of book IDs
export async function PUT(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderedIds } = await req.json();

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
  }

  // Verify all IDs belong to this author before updating
  const books = await prisma.book.findMany({
    where: { authorId, id: { in: orderedIds } },
    select: { id: true },
  });

  const validIds = new Set(books.map((b) => b.id));
  const updates = orderedIds
    .filter((id) => validIds.has(id))
    .map((id, index) =>
      prisma.book.update({ where: { id }, data: { sortOrder: index } })
    );

  await prisma.$transaction(updates);

  return NextResponse.json({ ok: true });
}
