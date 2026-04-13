import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
//import { prisma } from "@/lib/prisma";
import { prisma } from "@/lib/db";

async function isSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return false;
  const allowed = (process.env.SUPER_ADMIN_EMAIL ?? "").split(",").map((e) => e.trim().toLowerCase());
  return allowed.includes(session.user.email.toLowerCase());
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  try {
    if (body.isDefault) await prisma.plan.updateMany({ where: { id: { not: id } }, data: { isDefault: false } });
    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.monthlyPriceCents !== undefined && { monthlyPriceCents: body.monthlyPriceCents }),
        ...(body.annualPriceCents !== undefined && { annualPriceCents: body.annualPriceCents }),
        ...(body.stripePriceIdMonthly !== undefined && { stripePriceIdMonthly: body.stripePriceIdMonthly }),
        ...(body.stripePriceIdAnnual !== undefined && { stripePriceIdAnnual: body.stripePriceIdAnnual }),
        ...(body.maxBooks !== undefined && { maxBooks: body.maxBooks }),
        ...(body.maxPosts !== undefined && { maxPosts: body.maxPosts }),
        ...(body.maxStorageMb !== undefined && { maxStorageMb: body.maxStorageMb }),
        ...(body.customDomain !== undefined && { customDomain: body.customDomain }),
        ...(body.salesEnabled !== undefined && { salesEnabled: body.salesEnabled }),
        ...(body.flipBooksLimit !== undefined && { flipBooksLimit: body.flipBooksLimit }),
        ...(body.audioEnabled !== undefined && { audioEnabled: body.audioEnabled }),
        ...(body.newsletter !== undefined && { newsletter: body.newsletter }),
        ...(body.analyticsEnabled !== undefined && { analyticsEnabled: body.analyticsEnabled }),
        ...(body.badgeColor !== undefined && { badgeColor: body.badgeColor }),
        ...(body.featuredLabel !== undefined && { featuredLabel: body.featuredLabel }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
      },
    });
    return NextResponse.json(plan);
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "A plan with that slug already exists." }, { status: 400 });
    return NextResponse.json({ error: "Failed to update plan." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const subCount = await prisma.authorSubscription.count({ where: { planId: id } });
  if (subCount > 0) return NextResponse.json({ error: `Cannot delete — ${subCount} author(s) are on this plan.` }, { status: 400 });
  await prisma.plan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}