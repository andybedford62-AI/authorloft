import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { auditLog, getAuditContext } from "@/lib/audit-logger";
import crypto from "crypto";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; arcId: string }> }) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId, arcId } = await params;

    // Verify ARC belongs to author
    const arc = await prisma.arcCopy.findFirst({
      where: {
        id: arcId,
        bookId,
        book: { authorId },
      },
    });
    if (!arc) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    const readers = await prisma.arcReader.findMany({
      where: { arcCopyId: arcId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        tokenExpiresAt: true,
        invitedAt: true,
        downloadedAt: true,
        reviewedAt: true,
        reminderSentAt: true,
        downloads: {
          select: { fileId: true, downloadedAt: true },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    return NextResponse.json({
      readers: readers.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        status: r.status,
        tokenExpiresAt: r.tokenExpiresAt?.toISOString() ?? null,
        invitedAt: r.invitedAt?.toISOString() ?? null,
        downloadedAt: r.downloadedAt?.toISOString() ?? null,
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
        reminderSentAt: r.reminderSentAt?.toISOString() ?? null,
        downloadCount: r.downloads.length,
      })),
    });
  } catch (err: any) {
    console.error("[arc-readers] GET error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to fetch readers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; arcId: string }> }) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId, arcId } = await params;
    const body = await req.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name required" }, { status: 400 });
    }

    // Verify ARC belongs to author
    const arc = await prisma.arcCopy.findFirst({
      where: {
        id: arcId,
        bookId,
        book: { authorId },
      },
    });
    if (!arc) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    // Check if reader already exists
    const existing = await prisma.arcReader.findFirst({
      where: { arcCopyId: arcId, email },
    });

    if (existing) {
      return NextResponse.json({ error: "Reader already invited" }, { status: 400 });
    }

    // Create reader with token
    const reader = await prisma.arcReader.create({
      data: {
        arcCopyId: arcId,
        email,
        name,
        token: generateToken(),
        tokenExpiresAt: arc.expiresAt,
        invitedAt: new Date(),
      },
    });

    auditLog({
      userId: authorId,
      action: "Invite ARC reader",
      endpoint: `/api/admin/books/${bookId}/arc/${arcId}/readers`,
      method: "POST",
      statusCode: 200,
      ...getAuditContext(req),
      metadata: { bookId, arcId, readerEmail: email },
    });

    return NextResponse.json({
      reader: {
        id: reader.id,
        name: reader.name,
        email: reader.email,
        status: reader.status,
        token: reader.token,
      },
    });
  } catch (err: any) {
    console.error("[arc-readers] POST error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to invite reader" }, { status: 500 });
  }
}
