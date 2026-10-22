import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Signed-in state for the marketing nav/hero. These pages are statically cached,
// so the session can't be read while rendering them; the browser asks here instead.
export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  const session = await getServerSession(authOptions);
  const userId = session?.user ? ((session.user as any).id as string | undefined) : undefined;
  if (!userId) return NextResponse.json({ isAuthor: false, displayName: null }, { headers });

  const author = await prisma.author
    .findUnique({ where: { id: userId }, select: { name: true, displayName: true } })
    .catch(() => null);

  return NextResponse.json(
    {
      isAuthor: !!author,
      displayName: author?.displayName || author?.name || session?.user?.name || "My Account",
    },
    { headers },
  );
}
