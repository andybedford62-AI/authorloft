import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// One-time fix: sets isActive = true for the currently logged-in author.
// Visit GET /api/admin/activate-self while logged in to activate your account.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const authorId = (session.user as any).id as string;

  const author = await prisma.author.update({
    where: { id: authorId },
    data: { isActive: true },
    select: { id: true, name: true, slug: true, isActive: true },
  });

  return NextResponse.json({
    success: true,
    message: `Author "${author.name}" (${author.slug}) is now active.`,
    author,
  });
}
