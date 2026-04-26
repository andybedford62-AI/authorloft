import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSupabaseSignedUrl } from "@/lib/supabase-storage";

const downloadAttempts = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 60_000;
  const limit = 10;
  const times = (downloadAttempts.get(ip) ?? []).filter((t) => now - t < window);
  times.push(now);
  downloadAttempts.set(ip, times);
  return times.length > limit;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Load the order item — keep includes minimal to avoid Prisma relation issues
    const item = await prisma.orderItem.findFirst({
      where: { downloadToken: token },
      select: {
        id: true,
        fileKey: true,
        downloadCount: true,
        maxDownloads: true,
        downloadExpiry: true,
        book: { select: { slug: true, title: true } },
        order: { select: { status: true } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Invalid download link." }, { status: 404 });
    }

    // Must be a completed (paid) order
    if (item.order.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not confirmed yet." }, { status: 402 });
    }

    // Check link expiry
    if (item.downloadExpiry && new Date() > item.downloadExpiry) {
      return NextResponse.json({ error: "This download link has expired." }, { status: 410 });
    }

    // Check download limit
    if (item.downloadCount >= item.maxDownloads) {
      return NextResponse.json({ error: "Maximum downloads reached for this link." }, { status: 403 });
    }

    // fileKey must exist (set at checkout time from BookDirectSaleItem.fileKey)
    if (!item.fileKey) {
      return NextResponse.json(
        { error: "File not available yet. Please contact the author." },
        { status: 404 }
      );
    }

    // Derive a friendly filename from the key path (e.g. "crabbys-ocean-friends.epub")
    const keyParts   = item.fileKey.split("/");
    const storedName = keyParts[keyParts.length - 1]; // "1776166192590-abc.epub"
    const ext        = storedName.split(".").pop() ?? "epub";
    const downloadName = `${item.book.slug}.${ext}`;

    // Increment download count BEFORE generating the link
    await prisma.orderItem.update({
      where: { id: item.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Generate a 1-hour Supabase signed URL for the private bucket
    const signedUrl = await getSupabaseSignedUrl(
      "book-files",
      item.fileKey,
      3600,
      downloadName
    );

    return NextResponse.redirect(signedUrl);

  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("[download] Error:", msg);
    return NextResponse.json(
      { error: "Could not generate download link. Please try again or contact support." },
      { status: 500 }
    );
  }
}
