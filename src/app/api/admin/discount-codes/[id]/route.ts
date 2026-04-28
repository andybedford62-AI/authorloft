import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";

// PATCH /api/admin/discount-codes/[id] — toggle isActive
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authorId = await getAdminAuthorId();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing || existing.authorId !== authorId) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const updated = await prisma.discountCode.update({
      where: { id },
      data: {
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: { book: { select: { id: true, title: true } } },
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
