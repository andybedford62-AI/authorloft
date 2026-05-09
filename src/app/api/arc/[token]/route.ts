import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;

    // Verify token exists and hasn't expired
    const reader = await prisma.arcReader.findUnique({
      where: { token },
      include: {
        arcCopy: {
          include: {
            book: { select: { id: true, title: true } },
            files: {
              select: { id: true, format: true, fileName: true, fileSizeBytes: true },
            },
          },
        },
        downloads: { select: { fileId: true } },
      },
    });

    if (!reader) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
    }

    // Check if token has expired
    if (reader.tokenExpiresAt && new Date() > reader.tokenExpiresAt) {
      return NextResponse.json({ error: "This link has expired" }, { status: 403 });
    }

    const arc = reader.arcCopy;
    const downloadedFileIds = reader.downloads.map((d) => d.fileId);

    return NextResponse.json({
      reader: {
        id: reader.id,
        name: reader.name,
        email: reader.email,
      },
      arc: {
        id: arc.id,
        bookTitle: arc.book.title,
        disclaimer: arc.disclaimer,
        expiresAt: arc.tokenExpiresAt?.toISOString() ?? null,
      },
      files: arc.files.map((f) => ({
        id: f.id,
        format: f.format,
        fileName: f.fileName,
        fileSizeBytes: f.fileSizeBytes,
        downloaded: downloadedFileIds.includes(f.id),
      })),
      disclaimerAcknowledged: !!reader.disclaimerAcknowledgedAt,
    });
  } catch (err: any) {
    console.error("[arc-token] GET error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to fetch ARC" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;
    const body = await req.json();
    const { action } = body;

    // Verify token
    const reader = await prisma.arcReader.findUnique({
      where: { token },
      include: { arcCopy: true },
    });

    if (!reader) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (reader.arcCopy.tokenExpiresAt && new Date() > reader.arcCopy.tokenExpiresAt) {
      return NextResponse.json({ error: "Link has expired" }, { status: 403 });
    }

    if (action === "acknowledge-disclaimer") {
      await prisma.arcReader.update({
        where: { id: reader.id },
        data: { disclaimerAcknowledgedAt: new Date() },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("[arc-token] POST error:", err?.message ?? err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
