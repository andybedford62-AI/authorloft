import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { sendArcApprovalEmail, sendArcDeclinedEmail } from "@/lib/mailer";
import { DEFAULT_ARC_DISCLAIMER } from "@/lib/arc-constants";

// POST /api/admin/books/[id]/arc/[arcId]/readers/[readerId]/approve
// Body: { action: "approve" | "decline", tokenExpiresAt?: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; arcId: string; readerId: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId, arcId, readerId } = await params;

    const reader = await prisma.arcReader.findFirst({
      where: {
        id: readerId,
        arcCopyId: arcId,
        arcCopy: { bookId, book: { authorId } },
      },
      include: {
        arcCopy: {
          include: {
            book: { include: { author: { select: { name: true, displayName: true } } } },
          },
        },
      },
    });
    if (!reader) return NextResponse.json({ error: "Reader not found" }, { status: 404 });

    const body = await req.json();
    const { action, tokenExpiresAt } = body;

    if (action === "decline") {
      const updated = await prisma.arcReader.update({
        where: { id: readerId },
        data: { status: "DECLINED" },
      });
      await sendArcDeclinedEmail({
        to: reader.email,
        name: reader.name,
        bookTitle: reader.arcCopy.book.title,
      }).catch(() => {});
      return NextResponse.json(updated);
    }

    if (action === "approve") {
      const expiresAt = tokenExpiresAt
        ? new Date(tokenExpiresAt)
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      const updated = await prisma.arcReader.update({
        where: { id: readerId },
        data: {
          status: "INVITED",
          tokenExpiresAt: expiresAt,
          invitedAt: new Date(),
        },
      });

      const baseUrl = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
      const downloadUrl = `${baseUrl}/arc/download/${reader.token}`;
      const authorName =
        reader.arcCopy.book.author.displayName || reader.arcCopy.book.author.name;
      const disclaimer = reader.arcCopy.disclaimer ?? DEFAULT_ARC_DISCLAIMER;

      await sendArcApprovalEmail({
        to: reader.email,
        name: reader.name,
        bookTitle: reader.arcCopy.book.title,
        authorName,
        downloadUrl,
        expiresAt,
        disclaimer,
      }).catch(() => {});

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "action must be 'approve' or 'decline'" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[arc/readers/approve POST] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
