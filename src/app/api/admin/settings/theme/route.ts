import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const author = await prisma.author.findUnique({ where: { id: authorId }, select: { adminTheme: true } });
  return NextResponse.json({ theme: author?.adminTheme ?? "dark" });
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { theme } = await req.json();
  if (theme !== "dark" && theme !== "light") {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }
  await prisma.author.update({ where: { id: authorId }, data: { adminTheme: theme } });

  return NextResponse.json({ ok: true, theme });
}
