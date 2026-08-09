import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const authorId    = searchParams.get("authorId") || undefined;
  const status      = searchParams.get("status") || undefined;
  const platformId  = searchParams.get("platformId") || undefined;
  const promoTypeId = searchParams.get("promoTypeId") || undefined;
  const fromIso     = searchParams.get("from") || undefined;
  const toIso       = searchParams.get("to")   || undefined;
  const page        = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);

  const where: Record<string, unknown> = {};
  if (authorId)    where.authorId    = authorId;
  if (status)      where.status      = status;
  if (platformId)  where.platformId  = platformId;
  if (promoTypeId) where.promoTypeId = promoTypeId;
  if (fromIso || toIso) {
    where.createdAt = {
      ...(fromIso ? { gte: new Date(fromIso) } : {}),
      ...(toIso   ? { lte: new Date(toIso)   } : {}),
    };
  }

  const [rows, total] = await Promise.all([
    prisma.generatedSocialPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: {
        author:    { select: { id: true, name: true, displayName: true, email: true, slug: true } },
        platform:  { select: { id: true, slug: true, name: true } },
        promoType: { select: { id: true, slug: true, name: true } },
      },
    }),
    prisma.generatedSocialPost.count({ where }),
  ]);

  return NextResponse.json({ rows, total, page, pageSize: PAGE_SIZE });
}
