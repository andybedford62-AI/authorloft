import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { auditLog, getAuditContext } from "@/lib/audit-logger";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId } = await params;

    // Verify book belongs to author
    const book = await prisma.book.findFirst({
      where: { id: bookId, authorId },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    // Get ARC with files and reader counts
    const arc = await prisma.arcCopy.findFirst({
      where: { bookId },
      include: {
        files: {
          select: { id: true, format: true, fileName: true, fileSizeBytes: true, createdAt: true },
        },
        readers: {
          select: { id: true, status: true },
        },
      },
    });

    if (!arc) {
      return NextResponse.json({ arc: null });
    }

    return NextResponse.json({
      arc: {
        id: arc.id,
        disclaimer: arc.disclaimer,
        isActive: arc.isActive,
        expiresAt: arc.expiresAt?.toISOString() ?? null,
        createdAt: arc.createdAt.toISOString(),
        files: arc.files,
        readerCounts: {
          total: arc.readers.length,
          invited: arc.readers.filter((r) => r.status === "INVITED").length,
          downloaded: arc.readers.filter((r) => r.status === "DOWNLOADED").length,
          reviewed: arc.readers.filter((r) => r.status === "REVIEWED").length,
        },
      },
    });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[arc] GET error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId } = await params;
    const body = await req.json();
    const { disclaimer, expiresAt } = body;

    // Verify book belongs to author
    const book = await prisma.book.findFirst({
      where: { id: bookId, authorId },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    // Create or update ARC
    let arc = await prisma.arcCopy.findFirst({
      where: { bookId },
    });

    if (arc) {
      arc = await prisma.arcCopy.update({
        where: { id: arc.id },
        data: {
          disclaimer: disclaimer ?? arc.disclaimer,
          expiresAt: expiresAt ? new Date(expiresAt) : arc.expiresAt,
          isActive: true,
        },
      });
    } else {
      arc = await prisma.arcCopy.create({
        data: {
          bookId,
          disclaimer,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          isActive: true,
        },
      });
    }

    auditLog({
      userId: authorId,
      action: "Create/update ARC",
      endpoint: `/api/admin/books/${bookId}/arc`,
      method: "POST",
      statusCode: 200,
      ...getAuditContext(req),
      metadata: { bookId, arcId: arc.id },
    });

    return NextResponse.json({ arc: { id: arc.id, disclaimer: arc.disclaimer, expiresAt: arc.expiresAt?.toISOString() } });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[arc] POST error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId } = await params;

    // Verify book belongs to author
    const book = await prisma.book.findFirst({
      where: { id: bookId, authorId },
    });
    if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    // Delete ARC (cascade deletes files and readers)
    await prisma.arcCopy.deleteMany({
      where: { bookId },
    });

    auditLog({
      userId: authorId,
      action: "Delete ARC",
      endpoint: `/api/admin/books/${bookId}/arc`,
      method: "DELETE",
      statusCode: 200,
      ...getAuditContext(req),
      metadata: { bookId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[arc] DELETE error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to delete ARC" }, { status: 500 });
  }
}
