import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

export async function GET() {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tooltips = await prisma.helpTooltip.findMany({ orderBy: { tooltipKey: "asc" } });
  return NextResponse.json(tooltips);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { tooltipKey, title, content, learnMoreUrl } = await req.json();
  if (!tooltipKey?.trim() || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Key, title, and content are required." }, { status: 400 });
  }
  const tooltip = await prisma.helpTooltip.create({
    data: { tooltipKey: tooltipKey.trim(), title: title.trim(), content: content.trim(), learnMoreUrl: learnMoreUrl?.trim() || null },
  });
  return NextResponse.json(tooltip, { status: 201 });
}
