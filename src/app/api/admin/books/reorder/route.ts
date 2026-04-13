import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PUT /api/admin/books/reorder
// Body: { orderedIds: string[] }  — full ordered list of book IDs
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
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
