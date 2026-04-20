import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await prisma.campaign.findMany({
    where:   { authorId },
    orderBy: { sentAt: "desc" },
    select: {
      id:            true,
      subject:       true,
      sentAt:        true,
      totalSent:     true,
      totalFailed:   true,
      totalTargeted: true,
    },
  });

  return NextResponse.json(campaigns);
}
