import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";

const BOOKS_INCLUDE = {
  books: { include: { book: { select: { id: true, title: true } } } },
} as const;

// PATCH /api/admin/discount-codes/[id] — toggle isActive, showAsSalePrice, or replace bookIds
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authorId = await getAdminAuthorId();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing || existing.authorId !== authorId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    // Build book update if bookIds provided
    const booksUpdate =
      body.bookIds !== undefined
        ? {
            deleteMany: {},
            create: (body.bookIds as string[]).map((bid) => ({ bookId: bid })),
          }
        : undefined;

    const updated = await prisma.discountCode.update({
      where: { id },
      data: {
        ...(body.isActive !== undefined      && { isActive: body.isActive }),
        ...(body.showAsSalePrice !== undefined && { showAsSalePrice: body.showAsSalePrice }),
        ...(booksUpdate                       && { books: booksUpdate }),
      },
      include: BOOKS_INCLUDE,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not update." }, { status: 500 });
  }
}

// DELETE /api/admin/discount-codes/[id] — delete a code
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authorId = await getAdminAuthorId();
    const { id } = await params;

    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing || existing.authorId !== authorId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    await prisma.discountCode.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  }
}
