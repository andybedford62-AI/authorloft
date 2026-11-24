import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

const MAX_LENGTH = 1500;

export async function GET() {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { thankYouMessage: true, contactEmail: true, email: true },
  });
  return NextResponse.json({
    message:   author?.thankYouMessage ?? "",
    replyTo:   author?.contactEmail?.trim() || author?.email || "",
  });
}

export async function PUT(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();
  if (message != null && typeof message !== "string") {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
  const trimmed = (message ?? "").trim();
  if (trimmed.length > MAX_LENGTH) {
    return NextResponse.json({ error: `Keep your message under ${MAX_LENGTH} characters.` }, { status: 400 });
  }

  await prisma.author.update({
    where: { id: authorId },
    data:  { thankYouMessage: trimmed || null },
  });
  return NextResponse.json({ ok: true });
}
