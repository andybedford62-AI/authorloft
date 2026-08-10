import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const templates = await prisma.broadcastTemplate.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, subject, body, category } = await req.json();
  if (!name?.trim())    return NextResponse.json({ error: "Name is required." },    { status: 400 });
  if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
  if (!body?.trim())    return NextResponse.json({ error: "Body is required." },    { status: 400 });

  // New templates append to the end of the list rather than defaulting to
  // sortOrder 0, which would jump them ahead of every existing template.
  const last = await prisma.broadcastTemplate.findFirst({ orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
  const sortOrder = (last?.sortOrder ?? 0) + 10;

  const template = await prisma.broadcastTemplate.create({
    data: {
      name:     name.trim(),
      subject:  subject.trim(),
      body:     body.trim(),
      category: category?.trim() || "general",
      sortOrder,
    },
  });
  return NextResponse.json(template);
}
