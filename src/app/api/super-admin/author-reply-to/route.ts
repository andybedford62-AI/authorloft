import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main" },
    update: {},
    select: { authorReplyToEmail: true },
  });
  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { authorReplyToEmail } = await req.json();
  const value = typeof authorReplyToEmail === "string" ? authorReplyToEmail.trim() || null : null;
  const config = await prisma.systemConfig.upsert({
    where:  { id: "main" },
    create: { id: "main", authorReplyToEmail: value },
    update: { authorReplyToEmail: value },
    select: { authorReplyToEmail: true },
  });
  return NextResponse.json(config);
}
