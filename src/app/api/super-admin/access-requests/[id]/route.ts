import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.isSuperAdmin) return null;
  return session;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!await requireSuperAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { isRead } = await req.json();
  const updated = await prisma.accessRequest.update({
    where: { id: params.id },
    data: { isRead },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!await requireSuperAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.accessRequest.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
