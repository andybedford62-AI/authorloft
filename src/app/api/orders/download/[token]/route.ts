import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/s3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const item = await prisma.orderItem.findUnique({
    where: { downloadToken: token },
    include: {
      book: true,
      order: true,
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Invalid download link" }, { status: 404 });
  }

  // Check expiry
  if (item.downloadExpiry && new Date() > item.downloadExpiry) {
    return NextResponse.json({ error: "Download link has expired" }, { status: 410 });
  }

  // Check download count
  if (item.downloadCount >= item.maxDownloads) {
    return NextResponse.json(
      { error: "Maximum downloads reached" },
      { status: 403 }
    );
  }

  if (!item.book.fileUrl) {
    return NextResponse.json({ error: "File not available" }, { status: 404 });
  }

  // Increment download count
  await prisma.orderItem.update({
    where: { id: item.id },
    data: { downloadCount: { increment: 1 } },
  });

  // Generate a short-lived pre-signed S3 download URL
  const url = await getDownloadUrl(
    item.book.fileUrl,
    3600, // 1 hour
    `${item.book.slug}.epub`
  );

  return NextResponse.redirect(url);
}
