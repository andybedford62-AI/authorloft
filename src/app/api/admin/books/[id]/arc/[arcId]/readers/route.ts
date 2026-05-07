import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { canUseArc } from "@/lib/plan-limits";
import { sendArcInvitationEmail } from "@/lib/mailer";
import { DEFAULT_ARC_DISCLAIMER } from "@/lib/arc-constants";
import { randomBytes } from "crypto";

// GET /api/admin/books/[id]/arc/[arcId]/readers
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; arcId: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const arcCheck = await canUseArc(authorId);
    if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

    const { id: bookId, arcId } = await params;

    const arcCopy = await prisma.arcCopy.findFirst({
      where: { id: arcId, bookId, book: { authorId } },
      select: { id: true },
    });
    if (!arcCopy) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    const readers = await prisma.arcReader.findMany({
      where: { arcCopyId: arcId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(readers);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[arc/readers GET] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

// POST /api/admin/books/[id]/arc/[arcId]/readers — invite a reader
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; arcId: string }> }
) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const arcCheck = await canUseArc(authorId);
    if (!arcCheck.allowed) return NextResponse.json({ error: arcCheck.reason }, { status: 403 });

    const { id: bookId, arcId } = await params;

    const arcCopy = await prisma.arcCopy.findFirst({
      where: { id: arcId, bookId, book: { authorId } },
      include: { book: { include: { author: { select: { name: true, displayName: true } } } } },
    });
    if (!arcCopy) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    const body = await req.json();
    const { name, email, tokenExpiresAt } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    // Prevent duplicate invite for same email on same arc copy
    const existing = await prisma.arcReader.findFirst({
      where: { arcCopyId: arcId, email: emailLower },
    });
    if (existing) {
      return NextResponse.json({ error: "This reader has already been invited to this ARC" }, { status: 409 });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = tokenExpiresAt
      ? new Date(tokenExpiresAt)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

    const reader = await prisma.arcReader.create({
      data: {
        arcCopyId: arcId,
        name: name.trim(),
        email: emailLower,
        token,
        tokenExpiresAt: expiresAt,
        source: "INVITED",
        status: "INVITED",
        invitedAt: new Date(),
      },
    });

    const baseUrl = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
    const downloadUrl = `${baseUrl}/arc/download/${token}`;
    const authorName =
      arcCopy.book.author.displayName || arcCopy.book.author.name;
    const disclaimer = arcCopy.disclaimer ?? DEFAULT_ARC_DISCLAIMER;

    await sendArcInvitationEmail({
      to: emailLower,
      name: name.trim(),
      bookTitle: arcCopy.book.title,
      authorName,
      downloadUrl,
      expiresAt,
      disclaimer,
    }).catch(() => {});

    return NextResponse.json(reader, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[arc/readers POST] Error:", msg);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
