import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { authorName, authorRole, quote, rating, image, isActive, displayOrder } = await req.json();
  const data: Record<string, unknown> = {};
  if (authorName !== undefined)  data.authorName  = authorName.trim();
  if (authorRole !== undefined)  data.authorRole  = authorRole?.trim() || null;
  if (quote !== undefined)       data.quote       = quote.trim();
  if (rating !== undefined)      data.rating      = rating ?? null;
  if (image !== undefined)       data.image       = image || null;
  if (isActive !== undefined)    data.isActive    = isActive;
  if (displayOrder !== undefined) data.displayOrder = displayOrder;
  const updated = await prisma.testimonial.update({ where: { id }, data });
  revalidatePath("/");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
