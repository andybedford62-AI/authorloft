import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

// POST { type: string, ids: string[] } — renumbers sortOrder to 0..n-1
// within a single category type (blog | news | resource | faq).
export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { type, ids } = await req.json();
  if (typeof type !== "string" || !type) {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }
  if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string")) {
    return NextResponse.json({ error: "ids must be an array of strings" }, { status: 400 });
  }
  await prisma.$transaction(
    ids.map((id, i) => prisma.category.update({ where: { id }, data: { sortOrder: i } }))
  );
  const rows = await prisma.category.findMany({ where: { type } });
  return NextResponse.json(rows);
}
