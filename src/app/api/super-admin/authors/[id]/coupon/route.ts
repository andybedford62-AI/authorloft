import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { prisma } from "@/lib/db";

// PATCH /api/super-admin/authors/[id]/coupon
// Body: { couponId: string | null }  — assign or remove a coupon from an author
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { couponId } = await req.json();

  try {
    const author = await prisma.author.update({
      where:  { id },
      data:   { assignedCouponId: couponId ?? null },
      select: { id: true, assignedCouponId: true },
    });
    return NextResponse.json(author);
  } catch (err: any) {
    if (err?.code === "P2025") return NextResponse.json({ error: "Author not found." }, { status: 404 });
    return NextResponse.json({ error: "Failed to update coupon assignment." }, { status: 500 });
  }
}
