import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendArcApplicationConfirmEmail } from "@/lib/mailer";
import { randomBytes } from "crypto";

// POST /api/arc/apply — Phase 2: submit an ARC application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookId, name, email, reviewPlatforms, blogUrl, bio } = body;

    if (!bookId || !name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    // Find the active ArcCopy for this book
    const arcCopy = await prisma.arcCopy.findFirst({
      where: { bookId, isActive: true },
      include: { book: { select: { title: true, isPublished: true } } },
    });

    if (!arcCopy) {
      return NextResponse.json({ error: "No active ARC found for this book." }, { status: 404 });
    }

    // Prevent duplicate application
    const existing = await prisma.arcReader.findFirst({
      where: { arcCopyId: arcCopy.id, email: emailLower },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already applied for this ARC." }, { status: 409 });
    }

    // Generate token (not sent yet — only sent on approval)
    const token = randomBytes(32).toString("hex");

    const notesParts: string[] = [];
    if (reviewPlatforms?.length) notesParts.push(`Platforms: ${reviewPlatforms.join(", ")}`);
    if (blogUrl?.trim()) notesParts.push(`Blog/Social: ${blogUrl.trim()}`);
    if (bio?.trim()) notesParts.push(`Bio: ${bio.trim()}`);

    await prisma.arcReader.create({
      data: {
        arcCopyId: arcCopy.id,
        name: name.trim(),
        email: emailLower,
        token,
        source: "APPLIED",
        status: "PENDING",
        notes: notesParts.join("\n") || null,
      },
    });

    await sendArcApplicationConfirmEmail({
      to: emailLower,
      name: name.trim(),
      bookTitle: arcCopy.book.title,
    }).catch(() => {});

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[arc/apply POST] Error:", msg);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
