import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { auditLog, getAuditContext } from "@/lib/audit-logger";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; arcId: string }> }) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId, arcId } = await params;
    const body = await req.json();
    const { format, fileUrl, fileKey, fileName, fileSizeBytes } = body;

    if (!format || !fileUrl || !fileKey || !fileName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify book and ARC belong to author
    const arc = await prisma.arcCopy.findFirst({
      where: {
        id: arcId,
        bookId,
        book: { authorId },
      },
    });
    if (!arc) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    // Create or update file for this format
    let file = await prisma.arcFile.upsert({
      where: { arcCopyId_format: { arcCopyId: arcId, format } },
      create: {
        arcCopyId: arcId,
        format,
        fileUrl,
        fileKey,
        fileName,
        fileSizeBytes,
      },
      update: {
        fileUrl,
        fileKey,
        fileName,
        fileSizeBytes,
      },
    });

    auditLog({
      userId: authorId,
      action: "Upload ARC file",
      endpoint: `/api/admin/books/${bookId}/arc/${arcId}/files`,
      method: "POST",
      statusCode: 200,
      ...getAuditContext(req),
      metadata: { bookId, arcId, format },
    });

    return NextResponse.json({ file: { id: file.id, format: file.format, fileName: file.fileName } });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[arc-files] POST error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; arcId: string }> }) {
  try {
    const authorId = await getAdminAuthorIdForApi();
    if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: bookId, arcId } = await params;
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) return NextResponse.json({ error: "Missing fileId" }, { status: 400 });

    // Verify ARC belongs to author
    const arc = await prisma.arcCopy.findFirst({
      where: {
        id: arcId,
        bookId,
        book: { authorId },
      },
    });
    if (!arc) return NextResponse.json({ error: "ARC not found" }, { status: 404 });

    // Delete file (cascade deletes downloads)
    await prisma.arcFile.delete({
      where: { id: fileId },
    });

    auditLog({
      userId: authorId,
      action: "Delete ARC file",
      endpoint: `/api/admin/books/${bookId}/arc/${arcId}/files`,
      method: "DELETE",
      statusCode: 200,
      ...getAuditContext(req),
      metadata: { bookId, arcId, fileId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[arc-files] DELETE error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
