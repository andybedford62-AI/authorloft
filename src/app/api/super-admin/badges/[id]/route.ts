import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const data: { isActive?: boolean; threshold?: number } = {};
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.threshold === "number" && body.threshold >= 0) data.threshold = Math.round(body.threshold);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  try {
    const badge = await prisma.badgeDefinition.update({ where: { id }, data });
    return NextResponse.json(badge);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
