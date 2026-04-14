import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseSignedUrl } from "@/lib/supabase-storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const item = await prisma.orderItem.findUnique({
    where: { downloadToken: token },
    include: {
      book: { select: { slug: true, title: true } },
      saleItem: { select: { fileKey: true, fileName: true, format: true } },
      order: { select: { status: true } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Invalid download link" }, { status: 404 });
  }

  // Order must be completed (paid)
  if (item.order.status !== "COMPLETED") {
    return NextResponse.json({ error: "Payment not confirmed" }, { status: 402 });
  }

  // Check expiry
  if (item.downloadExpiry && new Date() > item.downloadExpiry) {
    return NextResponse.json({ error: "Download link has expired" }, { status: 410 });
  }

  // Check download count
  if (item.downloadCount >= item.maxDownloads) {
    return NextResponse.json({ error: "Maximum downloads reached" }, { status: 403 });
  }

  // Resolve the file to deliver:
  //   1. Prefer the saleItem.fileKey (format-specific file, e.g. the EBOOK PDF)
  //   2. Fall back to fileKey stored directly on OrderItem (copied at purchase time)
  //   3. Fall back to book-level fileUrl for legacy orders
  const fileKey = item.saleItem?.fileKey ?? item.fileKey ?? item.book?.slug ?? null;

  if (!fileKey) {
    return NextResponse.json({ error: "File not available — please contact the author." }, { status: 404 });
  }

  // Determine a friendly download filename
  const ext = item.saleItem?.fileName?.split(".").pop() ?? "pdf";
  const baseName = item.book?.slug ?? "download";
  const downloadName = `${baseName}.${ext}`;

  // Increment download count before generating the link
  await prisma.orderItem.update({
    where: { id: item.id },
    data: { downloadCount: { increment: 1 } },
  });

  try {
    // Generate a 1-hour Supabase signed URL (private bucket: "book-files")
    const signedUrl = await getSupabaseSignedUrl("book-files", fileKey, 3600, downloadName);
    return NextResponse.redirect(signedUrl);
  } catch (err: any) {
    console.error("[download] Failed to generate signed URL:", err?.message ?? err);
    return NextResponse.json(
      { error: "Could not generate download link. Please try again or contact support." },
      { status: 500 }
    );
  }
}
