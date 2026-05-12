import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topicId, title, slug, sortOrder } = await req.json();
  if (!topicId || !title?.trim() || !slug?.trim()) return NextResponse.json({ error: "topicId, title, and slug required." }, { status: 400 });
  const subtopic = await prisma.helpSubtopic.create({
    data: { topicId, title: title.trim(), slug: slug.trim(), sortOrder: sortOrder ?? 0 },
  });
  return NextResponse.json(subtopic, { status: 201 });
}
