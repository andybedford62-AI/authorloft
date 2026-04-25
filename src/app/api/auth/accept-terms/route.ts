import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authorId = (session.user as any).id as string;
  if (!authorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.author.update({
    where: { id: authorId },
    data: { termsAcceptedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
