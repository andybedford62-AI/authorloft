import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseArc } from "@/lib/plan-limits";
import { sendArcReminderEmail } from "@/lib/mailer";

// POST /api/admin/books/[id]/arc/[arcId]/readers/[readerId]/remind
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; arcId: string; readerId: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const arcCheck = await canUseArc(authorId);
    if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

    const { id: bookId, arcId, readerId } = await params;

    const reader = await prisma.arcReader.findFirst({
      where: {
        id: readerId,
        arcCopyId: arcId,
        arcCopy: {
          bookId,
          book: { authorId },
        },
      },
      include: {
        arcCopy: {
          include: { book: { select: { title: true } } },
        },
      },
    });
    if (!reader) return NextResponse.json({ error: "Reader not found" }, { status: 404 });

    const baseUrl = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
    const downloadUrl = `${baseUrl}/arc/download/${reader.token}`;

    await sendArcReminderEmail({
      to: reader.email,
      name: reader.name,
      bookTitle: reader.arcCopy.book.title,
      downloadUrl,
    }).catch(() => {});

    const updated = await prisma.arcReader.update({
      where: { id: readerId },
      data: { reminderSentAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[arc/readers/remind POST] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
