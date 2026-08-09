import { NextResponse } from "next/server";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export async function PATCH() {
  const authorId = await getAdminAuthorId();

  await prisma.author.update({
    where: { id: authorId },
    data:  { hideNextStepsChecklist: true },
  });

  return NextResponse.json({ ok: true });
}
