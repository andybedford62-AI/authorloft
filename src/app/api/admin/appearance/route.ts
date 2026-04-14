import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TEMPLATES } from "@/lib/templates";
import { ALL_THEMES } from "@/lib/themes";

const VALID_TEMPLATES = TEMPLATES.map((t) => t.id);
const VALID_THEMES    = ALL_THEMES.map((t) => t.id);

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const body = await req.json();
  const { homeTemplate, siteTheme } = body;

  // Validate whichever field was sent
  if (homeTemplate !== undefined && !VALID_TEMPLATES.includes(homeTemplate)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }
  if (siteTheme !== undefined && !VALID_THEMES.includes(siteTheme)) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  // Build update data from whichever fields were provided
  const data: Record<string, string> = {};
  if (homeTemplate !== undefined) data.homeTemplate = homeTemplate;
  if (siteTheme    !== undefined) data.siteTheme    = siteTheme;

  await prisma.author.update({ where: { id: authorId }, data });

  return NextResponse.json({ ok: true, ...data });
}
