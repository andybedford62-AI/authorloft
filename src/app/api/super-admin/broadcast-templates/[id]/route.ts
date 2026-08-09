import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, subject, body, category } = await req.json();
  if (!name?.trim())    return NextResponse.json({ error: "Name is required." },    { status: 400 });
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!body?.trim())    return NextResponse.json({ error: "Body is required." },    { status: 400 });
  const template = await prisma.broadcastTemplate.update({
    where: { id },
    data: {
      name:     name.trim(),
      subject:  subject.trim(),
      body:     body.trim(),
      category: category?.trim() || "general",
    },
  });
  return NextResponse.json(template);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.broadcastTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
