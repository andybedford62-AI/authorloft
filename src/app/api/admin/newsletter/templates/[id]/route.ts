import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.newsletterTemplate.deleteMany({ where: { id, authorId } });
  return NextResponse.json({ ok: true });
}
