import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

// PATCH /api/admin/settings/showcase — toggle the marketing page showcase opt-in
export async function PATCH(req: Request) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { showInShowcase } = await req.json();
  if (typeof showInShowcase !== "boolean") {
    return NextResponse.json({ error: "showInShowcase must be a boolean" }, { status: 400 });
  }

  await prisma.author.update({
    where: { id: authorId },
    data:  { showInShowcase },
  });

  return NextResponse.json({ ok: true, showInShowcase });
}

// GET /api/admin/settings/showcase — fetch current setting
export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { showInShowcase: true },
  });

  return NextResponse.json({ showInShowcase: author?.showInShowcase ?? false });
}
