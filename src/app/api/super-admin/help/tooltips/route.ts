import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isSuperAdmin) return null;
  return session;
}

export async function GET() {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tooltips = await prisma.helpTooltip.findMany({ orderBy: { tooltipKey: "asc" } });
  return NextResponse.json(tooltips);
}

export async function POST(req: NextRequest) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { tooltipKey, title, content, learnMoreUrl } = await req.json();
  if (!tooltipKey?.trim() || !title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Key, title, and content are required." }, { status: 400 });
  }
  const tooltip = await prisma.helpTooltip.create({
    data: { tooltipKey: tooltipKey.trim(), title: title.trim(), content: content.trim(), learnMoreUrl: learnMoreUrl?.trim() || null },
  });
  return NextResponse.json(tooltip, { status: 201 });
}
