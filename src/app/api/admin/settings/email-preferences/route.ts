import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { platformEmailOptOut: true },
  });
  return NextResponse.json({ optOut: author?.platformEmailOptOut ?? false });
}

export async function PATCH(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { optOut } = await req.json();
  if (typeof optOut !== "boolean") {
    return NextResponse.json({ error: "Invalid value" }, { status: 400 });
  }
  await prisma.author.update({
    where: { id: authorId },
    data:  { platformEmailOptOut: optOut },
  });
  return NextResponse.json({ ok: true, optOut });
}
