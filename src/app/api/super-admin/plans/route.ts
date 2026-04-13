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

export async function GET() {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plans = await prisma.plan.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { subscriptions: true } } } });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (body.isDefault) await prisma.plan.updateMany({ data: { isDefault: false } });
    const plan = await prisma.plan.create({
      data: {
        name: body.name, slug: body.slug, description: body.description ?? null,
        monthlyPriceCents: body.monthlyPriceCents ?? 0, annualPriceCents: body.annualPriceCents ?? 0,
        stripePriceIdMonthly: body.stripePriceIdMonthly ?? null, stripePriceIdAnnual: body.stripePriceIdAnnual ?? null,
        maxBooks: body.maxBooks ?? null, maxPosts: body.maxPosts ?? null, maxStorageMb: body.maxStorageMb ?? null,
        customDomain: body.customDomain ?? false, salesEnabled: body.salesEnabled ?? false,
        flipBooksLimit: body.flipBooksLimit ?? 0, audioEnabled: body.audioEnabled ?? false,
        newsletter: body.newsletter ?? false, analyticsEnabled: body.analyticsEnabled ?? false,
        badgeColor: body.badgeColor ?? "gray", featuredLabel: body.featuredLabel ?? null,
        sortOrder: body.sortOrder ?? 0, isActive: body.isActive ?? true, isDefault: body.isDefault ?? false,
      },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") return NextResponse.json({ error: "A plan with that slug already exists." }, { status: 400 });
    return NextResponse.json({ error: "Failed to create plan." }, { status: 500 });
  }
}