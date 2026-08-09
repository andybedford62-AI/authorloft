import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

/** GET — returns the current hero copy overrides */
export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await prisma.platformSettings.upsert({
    where:  { id: "singleton" },
    create: { id: "singleton" },
    update: {},
    select: { heroHeadlineLine1: true, heroHeadlineLine2: true, heroSubheadline: true },
  });

  return NextResponse.json(settings);
}

/** PATCH — update hero headline/subheadline overrides. Empty string reverts to default. */
export async function PATCH(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { heroHeadlineLine1, heroHeadlineLine2, heroSubheadline } = await req.json();

  const data = {
    heroHeadlineLine1: heroHeadlineLine1 || null,
    heroHeadlineLine2: heroHeadlineLine2 || null,
    heroSubheadline:   heroSubheadline || null,
  };

  await prisma.platformSettings.upsert({
    where:  { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  revalidatePath("/");
  return NextResponse.json({ ok: true, ...data });
}
