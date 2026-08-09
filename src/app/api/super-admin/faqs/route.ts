import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

// Public — homepage fetches active FAQs server-side
export async function GET() {
  const faqs = await prisma.homepageFaq.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { question, answer, category, sortOrder, isActive } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: "Question is required." }, { status: 400 });
  if (!answer?.trim())   return NextResponse.json({ error: "Answer is required." },   { status: 400 });
  const created = await prisma.homepageFaq.create({
    data: {
      question: question.trim(),
      answer:   answer.trim(),
      category: category?.trim() || null,
      sortOrder: sortOrder ?? 0,
      isActive:  isActive  ?? true,
    },
  });
  revalidatePath("/");
  revalidatePath("/faq");
  return NextResponse.json(created, { status: 201 });
}
