import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TEMPLATES } from "@/lib/templates";

const VALID_TEMPLATES = TEMPLATES.map((t) => t.id);

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const { homeTemplate } = await req.json();

  if (!VALID_TEMPLATES.includes(homeTemplate)) {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  await prisma.author.update({
    where: { id: authorId },
    data: { homeTemplate },
  });

  return NextResponse.json({ ok: true, homeTemplate });
}
