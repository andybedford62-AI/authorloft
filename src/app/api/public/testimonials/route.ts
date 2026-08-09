import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 3,
    select: {
      id: true,
      authorName: true,
      authorRole: true,
      quote: true,
      rating: true,
      image: true,
    },
  });
  return NextResponse.json(testimonials);
}
