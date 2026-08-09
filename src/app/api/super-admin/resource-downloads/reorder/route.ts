import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string")) {
    return NextResponse.json({ error: "ids must be an array of strings" }, { status: 400 });
  }
  await prisma.$transaction(
    ids.map((id, i) => prisma.resourceDownload.update({ where: { id }, data: { displayOrder: i } }))
  );
  revalidatePath("/resources");
  const rows = await prisma.resourceDownload.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(rows);
}
