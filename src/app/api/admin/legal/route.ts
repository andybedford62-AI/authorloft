import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authorId = (session.user as any).id;
  if (!authorId) {
    return NextResponse.json({ error: "Author not found" }, { status: 404 });
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
