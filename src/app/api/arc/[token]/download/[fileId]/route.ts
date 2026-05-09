import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { token: string; fileId: string } }) {
  try {
    const { token, fileId } = params;

    // Verify token and file exist
    const reader = await prisma.arcReader.findUnique({
      where: { token },
      include: {
        arcCopy: true,
      },
    });

    if (!reader) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    // Check expiration
    if (reader.arcCopy.tokenExpiresAt && new Date() > reader.arcCopy.tokenExpiresAt) {
      return NextResponse.json({ error: "Link has expired" }, { status: 403 });
    }

    // Verify file belongs to this ARC
    const file = await prisma.arcFile.findFirst({
      where: {
        id: fileId,
        arcCopyId: reader.arcCopyId,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Record download (upsert to avoid duplicates for same reader/file)
    await prisma.arcReaderDownload.upsert({
      where: {
        readerId_fileId: { readerId: reader.id, fileId },
      },
      create: {
        readerId: reader.id,
        fileId,
      },
      update: {
        downloadedAt: new Date(),
      },
    });

    // Update reader status if not already downloaded
    if (reader.status === "INVITED") {
      await prisma.arcReader.update({
        where: { id: reader.id },
        data: { status: "DOWNLOADED" },
      });
    }

    return NextResponse.json({
      fileUrl: file.fileUrl,
      fileName: file.fileName,
      format: file.format,
    });
  } catch (err: any) {
    console.error("[arc-download] POST error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
  }
}
