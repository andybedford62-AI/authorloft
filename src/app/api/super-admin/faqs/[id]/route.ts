import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { question, answer, category, sortOrder, isActive } = await req.json();
  const data: Record<string, unknown> = {};
  if (question  !== undefined) data.question  = question.trim();
  if (answer    !== undefined) data.answer    = answer.trim();
  if (category  !== undefined) data.category  = category?.trim() || null;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (isActive  !== undefined) data.isActive  = isActive;
  const updated = await prisma.homepageFaq.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/faq");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.homepageFaq.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
