import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const templates = await prisma.broadcastTemplate.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, subject, body } = await req.json();
  if (!name?.trim())    return NextResponse.json({ error: "Name is required." },    { status: 400 });
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!body?.trim())    return NextResponse.json({ error: "Body is required." },    { status: 400 });
  const template = await prisma.broadcastTemplate.create({
    data: { name: name.trim(), subject: subject.trim(), body: body.trim() },
  });
  return NextResponse.json(template);
}
