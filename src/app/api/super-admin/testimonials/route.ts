import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const testimonials = await prisma.testimonial.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(testimonials);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { authorName, authorRole, quote, rating, image, isActive, displayOrder } = await req.json();
  if (!authorName?.trim()) return NextResponse.json({ error: "Author name is required." }, { status: 400 });
  if (!quote?.trim()) return NextResponse.json({ error: "Quote is required." }, { status: 400 });
  const created = await prisma.testimonial.create({
    data: {
      authorName: authorName.trim(),
      authorRole: authorRole?.trim() || null,
      quote: quote.trim(),
      rating: rating ?? null,
      image: image || null,
      isActive: isActive ?? false,
      displayOrder: displayOrder ?? 0,
    },
  });
  revalidatePath("/");
  return NextResponse.json(created, { status: 201 });
}
