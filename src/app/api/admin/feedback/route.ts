import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import type { BookFeedbackStatus } from "@prisma/client";

// GET /api/admin/feedback?status=PENDING|APPROVED|REJECTED
export async function GET(req: NextRequest) {
  const uid = await getAdminAuthorIdForApi();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status") as BookFeedbackStatus | null;
  const validStatuses: BookFeedbackStatus[] = ["PENDING", "APPROVED", "REJECTED"];

  const feedback = await prisma.bookFeedback.findMany({
    where: {
      book: { authorId: uid },
      ...(status && validStatuses.includes(status) ? { status } : {}),
    },
    include: {
      book: { select: { id: true, title: true, slug: true, coverImageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ feedback });
}
