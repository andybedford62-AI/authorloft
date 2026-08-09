import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main" },
    update: {},
    select: { defaultAiUsageCap: true },
  });
  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const newCap = parseInt(body.defaultAiUsageCap, 10);

  if (isNaN(newCap) || newCap < 0 || newCap > 10000) {
    return NextResponse.json({ error: "Invalid cap value (0–10000)." }, { status: 400 });
  }

  // Get the current baseline BEFORE updating, so we know who to cascade to
  const current = await prisma.systemConfig.findUnique({
    where:  { id: "main" },
    select: { defaultAiUsageCap: true },
  });
  const oldCap = current?.defaultAiUsageCap ?? 20;

  // Save the new baseline
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main", defaultAiUsageCap: newCap },
    update: { defaultAiUsageCap: newCap },
    select: { defaultAiUsageCap: true },
  });

  // Cascade to all authors whose cap exactly matches the old baseline.
  // Authors who were manually set higher (or lower) are left untouched.
  const { count } = await prisma.author.updateMany({
    where: { aiUsageCap: oldCap },
    data:  { aiUsageCap: newCap },
  });

  return NextResponse.json({ defaultAiUsageCap: config.defaultAiUsageCap, updatedAuthors: count });
}
