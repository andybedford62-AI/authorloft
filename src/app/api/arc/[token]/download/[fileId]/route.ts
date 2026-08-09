import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseSignedUrl } from "@/lib/supabase-storage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string; fileId: string }> }) {
  try {
    const { token, fileId } = await params;

    const reader = await prisma.arcReader.findUnique({
      where: { token },
    });

    if (!reader) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (reader.tokenExpiresAt && new Date() > reader.tokenExpiresAt) {
      return NextResponse.json({ error: "Link has expired" }, { status: 403 });
    }

    if (!reader.disclaimerAcknowledgedAt) {
      return NextResponse.json({ error: "Disclaimer not acknowledged" }, { status: 403 });
    }

    // Verify file belongs to this ARC
    const file = await prisma.arcFile.findFirst({
      where: { id: fileId, arcCopyId: reader.arcCopyId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Generate a signed download URL (valid for 1 hour)
    const signedUrl = await getSupabaseSignedUrl("book-files", file.fileKey, 3600, file.fileName);

    // Record download
    await prisma.arcReaderDownload.upsert({
      where: { readerId_fileId: { readerId: reader.id, fileId } },
      create: { readerId: reader.id, fileId },
      update: { downloadedAt: new Date() },
    });

    // Update reader status
    if (reader.status === "INVITED") {
      await prisma.arcReader.update({
        where: { id: reader.id },
        data: { status: "DOWNLOADED", downloadedAt: new Date() },
      });
    }

    return NextResponse.json({ fileUrl: signedUrl, fileName: file.fileName, format: file.format });
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[arc-download] POST error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
