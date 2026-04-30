import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";

const BOOKS_INCLUDE = {
  books: { include: { book: { select: { id: true, title: true } } } },
} as const;

// PATCH /api/admin/discount-codes/[id] — full edit or toggle isActive/showAsSalePrice/bookIds
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authorId = await getAdminAuthorId();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing || existing.authorId !== authorId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    // Validate type/value when provided
    if (body.type !== undefined && body.type !== "PERCENT" && body.type !== "FIXED") {
      return NextResponse.json({ error: "Invalid discount type." }, { status: 400 });
    }
    const type = body.type ?? existing.type;
    if (body.value !== undefined) {
      if (type === "PERCENT" && (body.value < 1 || body.value > 100)) {
        return NextResponse.json({ error: "Percentage must be 1–100." }, { status: 400 });
      }
      if (body.value < 1) {
        return NextResponse.json({ error: "Value must be at least 1." }, { status: 400 });
      }
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
        ...(body.code            !== undefined && { code: (body.code as string).toUpperCase().trim() }),
        ...(body.description     !== undefined && { description: body.description || null }),
        ...(body.type            !== undefined && { type: body.type }),
        ...(body.value           !== undefined && { value: body.value }),
        ...(body.maxUses         !== undefined && { maxUses: body.maxUses ?? null }),
        ...(body.expiresAt       !== undefined && { expiresAt: body.expiresAt ? new Date(body.expiresAt) : null }),
        ...(body.isActive        !== undefined && { isActive: body.isActive }),
        ...(body.showAsSalePrice !== undefined && { showAsSalePrice: body.showAsSalePrice }),
        ...(booksUpdate                        && { books: booksUpdate }),
      },
      include: BOOKS_INCLUDE,
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "That code already exists." }, { status: 409 });
    }
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
