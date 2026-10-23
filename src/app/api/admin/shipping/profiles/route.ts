import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { shippingProfileSchema } from "@/lib/schemas/shipping";

const MAX_PROFILES = 25;

// POST — create a shipping profile with its zones.
export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = shippingProfileSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid shipping profile." }, { status: 400 });
  }
  if ((await prisma.shippingProfile.count({ where: { authorId } })) >= MAX_PROFILES) {
    return NextResponse.json({ error: `You can have up to ${MAX_PROFILES} shipping profiles.` }, { status: 400 });
  }

  const { name, freeOverCents, zones } = parsed.data;
  const profile = await prisma.shippingProfile.create({
    data: {
      authorId,
      name,
      freeOverCents,
      zones: { create: zones.map((z, i) => ({ ...z, sortOrder: i })) },
    },
    include: { zones: { orderBy: { sortOrder: "asc" } } },
  });
  return NextResponse.json({ ...profile, itemCount: 0 }, { status: 201 });
}
