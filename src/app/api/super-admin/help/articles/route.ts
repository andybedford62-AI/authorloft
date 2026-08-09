import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const topicId = req.nextUrl.searchParams.get("topicId") ?? undefined;
  const articles = await prisma.helpArticle.findMany({
    where: topicId ? { topicId } : undefined,
    orderBy: [{ topicId: "asc" }, { sortOrder: "asc" }],
    include: {
      topic:    { select: { id: true, title: true } },
      subtopic: { select: { id: true, title: true } },
    },
  });
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { topicId, subtopicId, question, answer, sortOrder, isPublished } = await req.json();
  if (!topicId || !question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: "topicId, question, and answer are required." }, { status: 400 });
  }
  const article = await prisma.helpArticle.create({
    data: {
      topicId,
      subtopicId: subtopicId || null,
      question:   question.trim(),
      answer:     answer.trim(),
      sortOrder:  sortOrder ?? 0,
      isPublished: isPublished ?? true,
    },
  });
  return NextResponse.json(article, { status: 201 });
}
