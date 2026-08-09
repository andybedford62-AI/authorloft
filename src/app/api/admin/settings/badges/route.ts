import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// PATCH /api/admin/settings/badges — toggle whether earned badges show publicly
export async function PATCH(req: Request) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { showBadges } = await req.json();
  if (typeof showBadges !== "boolean") {
    return NextResponse.json({ error: "showBadges must be a boolean" }, { status: 400 });
  }

  await prisma.author.update({ where: { id: authorId }, data: { showBadges } });
  return NextResponse.json({ ok: true, showBadges });
}

// GET /api/admin/settings/badges — fetch current setting
export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({ where: { id: authorId }, select: { showBadges: true } });
  return NextResponse.json({ showBadges: author?.showBadges ?? true });
}
