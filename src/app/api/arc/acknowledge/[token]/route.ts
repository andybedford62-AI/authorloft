import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseSignedUrl } from "@/lib/supabase-storage";
import { DEFAULT_ARC_DISCLAIMER } from "@/lib/arc-constants";

// POST /api/arc/acknowledge/[token]
// Validates token, records acknowledgement + download, returns a 1-hour signed URL.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const reader = await prisma.arcReader.findUnique({
      where: { token },
      include: {
        arcCopy: {
          include: { book: { select: { title: true } } },
        },
      },
    });

    if (!reader) {
      return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
    }

    if (reader.status === "DECLINED") {
      return NextResponse.json({ error: "This ARC link has been revoked." }, { status: 400 });
    }

    if (reader.tokenExpiresAt && reader.tokenExpiresAt < new Date()) {
      return NextResponse.json({ error: "This download link has expired." }, { status: 400 });
    }

    if (!reader.arcCopy.isActive) {
      return NextResponse.json({ error: "This ARC is no longer available." }, { status: 400 });
    }

    const disclaimerText = reader.arcCopy.disclaimer ?? DEFAULT_ARC_DISCLAIMER;

    // Record acknowledgement and download timestamp
    await prisma.arcReader.update({
      where: { token },
      data: {
        disclaimerAcknowledgedAt: reader.disclaimerAcknowledgedAt ?? new Date(),
        disclaimerText: reader.disclaimerText ?? disclaimerText,
        downloadedAt: reader.downloadedAt ?? new Date(),
        status: reader.status === "INVITED" || reader.status === "PENDING" ? "DOWNLOADED" : reader.status,
      },
    });

    // Generate 1-hour signed download URL
    const signedUrl = await getSupabaseSignedUrl(
      "arc-files",
      reader.arcCopy.fileKey,
      3600,
      reader.arcCopy.fileName
    );

    return NextResponse.json({ signedUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[arc/acknowledge] Error:", msg);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
