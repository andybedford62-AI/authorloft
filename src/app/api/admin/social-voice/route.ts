import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const MAX_LEN = 500;

export async function PATCH(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { voice } = await req.json();
  if (voice !== null && typeof voice !== "string") {
    return NextResponse.json({ error: "Invalid voice value." }, { status: 400 });
  }
  const cleaned = typeof voice === "string" ? voice.trim().slice(0, MAX_LEN) : null;

  await prisma.author.update({
    where: { id: authorId },
    data:  { socialVoiceDescription: cleaned || null },
  });
  return NextResponse.json({ ok: true, voice: cleaned || null });
}
