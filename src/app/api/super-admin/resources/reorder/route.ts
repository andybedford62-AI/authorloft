import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

// POST { ids: string[] } — renumbers displayOrder to 0..n-1 in the given order
export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string")) {
    return NextResponse.json({ error: "ids must be an array of strings" }, { status: 400 });
  }
  await prisma.$transaction(
    ids.map((id, i) => prisma.platformResource.update({ where: { id }, data: { displayOrder: i } }))
  );
  revalidatePath("/");
  const rows = await prisma.platformResource.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(rows);
}
