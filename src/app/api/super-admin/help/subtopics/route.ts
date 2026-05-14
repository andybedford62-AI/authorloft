import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topicId, title, slug, sortOrder } = await req.json();
  if (!topicId || !title?.trim() || !slug?.trim()) return NextResponse.json({ error: "topicId, title, and slug required." }, { status: 400 });
  const subtopic = await prisma.helpSubtopic.create({
    data: { topicId, title: title.trim(), slug: slug.trim(), sortOrder: sortOrder ?? 0 },
  });
  return NextResponse.json(subtopic, { status: 201 });
}
