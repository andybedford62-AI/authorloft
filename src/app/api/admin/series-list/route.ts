import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const series = await prisma.series.findMany({
    where: { authorId },
    include: { _count: { select: { books: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(series);
}
