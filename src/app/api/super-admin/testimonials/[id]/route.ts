import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
