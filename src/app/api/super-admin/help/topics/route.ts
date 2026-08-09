import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const topics = await prisma.helpTopic.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      subtopics: { orderBy: { sortOrder: "asc" } },
      _count: { select: { articles: true } },
    },
  });
  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, slug, description, icon, sortOrder, isPublished } = await req.json();
  if (!title?.trim() || !slug?.trim()) return NextResponse.json({ error: "Title and slug required." }, { status: 400 });
  const topic = await prisma.helpTopic.create({
    data: { title: title.trim(), slug: slug.trim(), description: description?.trim() || null, icon: icon?.trim() || null, sortOrder: sortOrder ?? 0, isPublished: isPublished ?? true },
  });
  return NextResponse.json(topic, { status: 201 });
}
