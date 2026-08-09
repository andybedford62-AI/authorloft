import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const VALID_TYPES = ["book", "course", "both"] as const;

export async function PATCH(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorType } = await req.json();
  if (!VALID_TYPES.includes(creatorType)) {
    return NextResponse.json({ error: "creatorType must be 'book', 'course', or 'both'." }, { status: 400 });
  }

  await prisma.author.update({
    where: { id: authorId },
    data: { creatorType },
  });

  return NextResponse.json({ creatorType });
}
