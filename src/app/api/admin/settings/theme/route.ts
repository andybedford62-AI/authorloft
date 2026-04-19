import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const authorId = (session.user as any).id as string;
  const author = await prisma.author.findUnique({ where: { id: authorId }, select: { adminTheme: true } });
  return NextResponse.json({ theme: author?.adminTheme ?? "dark" });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { theme } = await req.json();
  if (theme !== "dark" && theme !== "light") {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  const authorId = (session.user as any).id as string;
  await prisma.author.update({ where: { id: authorId }, data: { adminTheme: theme } });

  return NextResponse.json({ ok: true, theme });
}
