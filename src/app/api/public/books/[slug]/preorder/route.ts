import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { domain, email, name } = body;

    if (!domain || !email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const author = await prisma.author.findFirst({
      where: { OR: [{ slug: domain }, { customDomain: domain }], isActive: true },
      select: { id: true },
    });
    if (!author) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const book = await prisma.book.findFirst({
      where: { authorId: author.id, slug, isPublished: true, isPreOrder: true },
      select: { id: true },
    });
    if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });

    await prisma.preOrderSignup.upsert({
      where: { bookId_email: { bookId: book.id, email: email.toLowerCase().trim() } },
      create: {
        bookId: book.id,
        authorId: author.id,
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
      },
      update: {
        name: name?.trim() || undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[preorder-signup] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
