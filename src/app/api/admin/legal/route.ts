import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function PUT(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { legalNotice } = await req.json();

  await prisma.author.update({
    where: { id: authorId },
    data: {
      legalNotice: legalNotice?.trim() || null,
      legalNoticeUpdatedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
