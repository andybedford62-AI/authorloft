import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { isShippableCountry } from "@/lib/shipping-countries";

// GET /api/admin/shipping -> { shipFromCountry, profiles: [{ id, name, freeOverCents, itemCount, zones }] }
export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [author, profiles] = await Promise.all([
    prisma.author.findUnique({ where: { id: authorId }, select: { shipFromCountry: true } }),
    prisma.shippingProfile.findMany({
      where: { authorId },
      orderBy: { createdAt: "asc" },
      include: { zones: { orderBy: { sortOrder: "asc" } }, _count: { select: { saleItems: true } } },
    }),
  ]);

  return NextResponse.json({
    shipFromCountry: author?.shipFromCountry ?? null,
    profiles: profiles.map(({ _count, ...p }) => ({ ...p, itemCount: _count.saleItems })),
  });
}

// PUT { shipFromCountry: "US" | null } — where the author ships from; pre-fills a new profile's first zone.
export async function PUT(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = body.shipFromCountry;
  if (code !== null && (typeof code !== "string" || !isShippableCountry(code))) {
    return NextResponse.json({ error: "Choose a supported country." }, { status: 400 });
  }
  await prisma.author.update({ where: { id: authorId }, data: { shipFromCountry: code } });
  return NextResponse.json({ ok: true, shipFromCountry: code });
}
