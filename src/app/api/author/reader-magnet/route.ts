import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { syncSubscriberToProvider, type EmailProvider } from "@/lib/email-integrations";
import { sendReaderMagnetEmail } from "@/lib/mailer";

const schema = z.object({
  bookId:    z.string(),
  saleItemId: z.string(),
  authorId:  z.string(),
  email:     z.string().email(),
  name:      z.string().optional(),
});

// Best-effort in-memory rate limit: 5 magnet requests per email per hour
const attempts = new Map<string, number[]>();
function checkRateLimit(key: string): boolean {
  const now  = Date.now();
  const hits = (attempts.get(key) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= 5) return false;
  hits.push(now);
  attempts.set(key, hits);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`${ip}:${data.email}`)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Verify the sale item is a reader magnet and has a file
    const saleItem = await prisma.bookDirectSaleItem.findFirst({
      where: { id: data.saleItemId, bookId: data.bookId, isReaderMagnet: true },
      select: { id: true, fileKey: true, fileName: true, label: true },
    });
    if (!saleItem?.fileKey) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [author, book] = await Promise.all([
      prisma.author.findUnique({
        where: { id: data.authorId },
        select: { name: true, displayName: true, emailProvider: true, emailProviderKey: true, emailProviderExtra: true },
      }),
      prisma.book.findUnique({
        where: { id: data.bookId },
        select: { title: true, coverImageUrl: true },
      }),
    ]);
    if (!author || !book) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Add to newsletter list
    const [subscriber] = await Promise.all([
      prisma.subscriber.upsert({
        where: { authorId_email: { authorId: data.authorId, email: data.email } },
        update: { name: data.name },
        create: { authorId: data.authorId, email: data.email, name: data.name, isConfirmed: true },
      }),
    ]);

    // Fire-and-forget external provider sync
    if (author.emailProvider && author.emailProviderKey) {
      syncSubscriberToProvider(
        author.emailProvider as EmailProvider,
        author.emailProviderKey,
        author.emailProviderExtra ?? null,
        data.email,
        data.name
      ).catch((err) => console.error("[reader-magnet] External sync failed:", err));
    }

    // Create download lead
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const lead = await prisma.bookMagnetLead.create({
      data: {
        bookId:        data.bookId,
        saleItemId:    data.saleItemId,
        authorId:      data.authorId,
        email:         data.email,
        name:          data.name,
        downloadExpiry: expiry,
      },
    });

    const baseUrl = (process.env.NEXTAUTH_URL ?? "https://www.authorloft.com").replace(/\/$/, "");
    const downloadUrl = `${baseUrl}/api/reader-magnet/download/${lead.downloadToken}`;
    const authorName  = author.displayName || author.name;

    // Send email with download link
    await sendReaderMagnetEmail({
      to:           data.email,
      authorName,
      bookTitle:    book.title,
      coverImageUrl: book.coverImageUrl,
      downloadUrl,
      downloadExpiry: expiry,
    });

    void subscriber; // suppress unused var lint

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error("[reader-magnet] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
