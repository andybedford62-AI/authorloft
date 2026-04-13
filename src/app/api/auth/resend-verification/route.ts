import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { randomBytes } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authorId = (session.user as any).id as string;

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { id: true, email: true, emailVerified: true },
  });

  if (!author) {
    return NextResponse.json({ error: "Author not found." }, { status: 404 });
  }

  if (author.emailVerified) {
    return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
  }

  // Generate a new token (expires in 24 hours)
  const token = randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.author.update({
    where: { id: authorId },
    data: { emailVerifyToken: token, emailVerifyExpiry: expiry },
  });

  sendVerificationEmail(author.email, token).catch((err) => {
    console.error("[resend-verification] Failed to send email:", err);
  });

  return NextResponse.json({ ok: true });
}
