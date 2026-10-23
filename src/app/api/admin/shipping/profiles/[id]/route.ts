import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { shippingProfileSchema } from "@/lib/schemas/shipping";

// PUT — replace a profile's name, free-shipping threshold and zones.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.shippingProfile.findFirst({ where: { id, authorId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = shippingProfileSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid shipping profile." }, { status: 400 });
  }
  const { name, freeOverCents, zones } = parsed.data;

  const profile = await prisma.$transaction(async (tx) => {
    await tx.shippingZone.deleteMany({ where: { profileId: id } });
    return tx.shippingProfile.update({
      where: { id },
      data: { name, freeOverCents, zones: { create: zones.map((z, i) => ({ ...z, sortOrder: i })) } },
      include: { zones: { orderBy: { sortOrder: "asc" } }, _count: { select: { saleItems: true } } },
    });
  });
  const { _count, ...rest } = profile;
  return NextResponse.json({ ...rest, itemCount: _count.saleItems });
}

// DELETE — refused while any print edition still uses the profile (it would silently stop being sellable).
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.shippingProfile.findFirst({
    where: { id, authorId },
    select: { id: true, _count: { select: { saleItems: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing._count.saleItems > 0) {
    const n = existing._count.saleItems;
    return NextResponse.json(
      { error: `${n} print edition${n === 1 ? " uses" : "s use"} this profile. Move ${n === 1 ? "it" : "them"} to another profile first.` },
      { status: 409 }
    );
  }
  await prisma.shippingProfile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
