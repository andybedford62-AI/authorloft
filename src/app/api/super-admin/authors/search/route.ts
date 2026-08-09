import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

// GET /api/super-admin/authors/search?q=andy
export async function GET(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const authors = await prisma.author.findMany({
    where: {
      OR: [
        { email:       { contains: q, mode: "insensitive" } },
        { name:        { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
        { slug:        { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, email: true, name: true, displayName: true, slug: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(authors);
}
