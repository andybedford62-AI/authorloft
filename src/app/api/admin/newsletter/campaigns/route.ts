import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseFeature } from "@/lib/plan-limits";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = await canUseFeature(authorId, "newsletter");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

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
