import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const COOKIE = "al_impersonate";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const caller = await prisma.author.findUnique({
    where: { id: (session.user as any).id },
    select: { isSuperAdmin: true },
  });
  return caller?.isSuperAdmin ? session : null;
}

// POST /api/super-admin/impersonate — start impersonating an author
export async function POST(req: NextRequest) {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { authorId } = await req.json();
  if (!authorId) return NextResponse.json({ error: "authorId required" }, { status: 400 });

  const target = await prisma.author.findUnique({
    where: { id: authorId },
    select: { id: true },
  });
  if (!target) return NextResponse.json({ error: "Author not found" }, { status: 404 });

  const res = NextResponse.json({ ok: true });
  const secure = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
  res.cookies.set(COOKIE, authorId, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}

// DELETE /api/super-admin/impersonate — stop impersonating
export async function DELETE() {
  const session = await requireSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
