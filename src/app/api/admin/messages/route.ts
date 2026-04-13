import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/messages — list messages for the current author
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "inbox"; // inbox | archived | all

  const where: Record<string, unknown> = { authorId };
  if (filter === "inbox") where.isArchived = false;
  if (filter === "archived") where.isArchived = true;

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      senderName: true,
      senderEmail: true,
      website: true,
      subject: true,
      message: true,
      isRead: true,
      isArchived: true,
      createdAt: true,
    },
  });

  // Unread count for badge (inbox only)
  const unreadCount = await prisma.contactMessage.count({
    where: { authorId, isRead: false, isArchived: false },
  });

  return NextResponse.json({ messages, unreadCount });
}

// PATCH /api/admin/messages — bulk mark-as-read or mark-all-read
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
  const body = await req.json();
  const { action } = body; // "markAllRead"

  if (action === "markAllRead") {
    await prisma.contactMessage.updateMany({
      where: { authorId, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
