import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const crabbyId = "cmmxvfhri000w9fs8jdut762r";
    const bennyId = "cmmxvfhhz000u9fs81ybmnlt7";

    const data = await prisma.$queryRaw`
      SELECT
        b.id as book_id,
        b.title as book_title,
        ac.id as arc_id,
        af.id as file_id,
        af.format,
        af."fileName"
      FROM books b
      LEFT JOIN "ArcCopy" ac ON ac."bookId" = b.id
      LEFT JOIN "ArcFile" af ON af."arcCopyId" = ac.id
      WHERE b.id IN (${crabbyId}, ${bennyId})
      ORDER BY b.title, ac.id, af.id
    `;

    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("[debug/arc-check]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
