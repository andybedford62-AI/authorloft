import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseSignedUrl } from "@/lib/supabase-storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const lead = await prisma.bookMagnetLead.findUnique({
    where: { downloadToken: token },
    include: { saleItem: { select: { fileKey: true, fileName: true } } },
  });

  if (!lead) {
    return new NextResponse("Download link not found.", { status: 404 });
  }

  if (lead.downloadExpiry && lead.downloadExpiry < new Date()) {
    return new NextResponse("This download link has expired.", { status: 410 });
  }

  if (lead.downloadCount >= lead.maxDownloads) {
    return new NextResponse("This download link has reached its maximum use limit.", { status: 410 });
  }

  if (!lead.saleItem.fileKey) {
    return new NextResponse("File not available.", { status: 404 });
  }

  // Increment download count
  await prisma.bookMagnetLead.update({
    where: { id: lead.id },
    data: { downloadCount: { increment: 1 } },
  });

  try {
    const signedUrl = await getSupabaseSignedUrl(
      "book-files",
      lead.saleItem.fileKey,
      3600,
      lead.saleItem.fileName ?? undefined
    );
    return NextResponse.redirect(signedUrl);
  } catch (err) {
    console.error("[reader-magnet/download] Signed URL error:", err);
    return new NextResponse("Could not generate download link.", { status: 500 });
  }
}
