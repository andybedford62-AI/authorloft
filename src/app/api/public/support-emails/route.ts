import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public endpoint — no auth required.
// Returns only active support emails for use in contact form dropdowns.
export async function GET() {
  const emails = await prisma.supportEmail.findMany({
    where: { isActive: true },
    select: { id: true, label: true, email: true, description: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(emails);
}
