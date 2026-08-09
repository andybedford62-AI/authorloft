import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const emails = await prisma.supportEmail.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json(emails);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { label, email, description, isActive, sortOrder } = await req.json();
  if (!label?.trim()) return NextResponse.json({ error: "Label is required." }, { status: 400 });
  if (!email?.trim()) return NextResponse.json({ error: "Email is required." }, { status: 400 });
  const created = await prisma.supportEmail.create({
    data: {
      label: label.trim(),
      email: email.trim(),
      description: description?.trim() || null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
