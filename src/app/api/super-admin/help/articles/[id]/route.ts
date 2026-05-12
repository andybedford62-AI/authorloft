import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) return null;
  return session;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const article = await prisma.helpArticle.findUnique({
    where: { id },
    include: {
      topic:    { select: { id: true, title: true } },
      subtopic: { select: { id: true, title: true } },
    },
  });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const article = await prisma.helpArticle.update({
    where: { id },
    data: {
      ...(data.topicId     !== undefined && { topicId:     data.topicId }),
      ...(data.subtopicId  !== undefined && { subtopicId:  data.subtopicId || null }),
      ...(data.question    !== undefined && { question:    data.question.trim() }),
      ...(data.answer      !== undefined && { answer:      data.answer.trim() }),
      ...(data.sortOrder   !== undefined && { sortOrder:   data.sortOrder }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
    },
  });
  return NextResponse.json(article);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.helpArticle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
