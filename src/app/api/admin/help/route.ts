import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public read — no auth required, only published content returned
export async function GET() {
  const topics = await prisma.helpTopic.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    include: {
      subtopics: {
        orderBy: { sortOrder: "asc" },
        include: {
          articles: {
            where: { isPublished: true },
            orderBy: { sortOrder: "asc" },
            select: { id: true, question: true, answer: true, sortOrder: true },
          },
        },
      },
      articles: {
        where: { isPublished: true, subtopicId: null },
        orderBy: { sortOrder: "asc" },
        select: { id: true, question: true, answer: true, sortOrder: true },
      },
    },
  });

  const tooltips = await prisma.helpTooltip.findMany({
    select: { tooltipKey: true, title: true, content: true, learnMoreUrl: true },
  });

  return NextResponse.json({ topics, tooltips }, { headers: { "Cache-Control": "public, s-maxage=60" } });
}
