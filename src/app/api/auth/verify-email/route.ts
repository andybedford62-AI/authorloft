import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/mailer";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/verify-email/invalid", req.url));
  }

  try {
    const author = await prisma.author.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: { gt: new Date() },
      },
      select: { id: true, email: true, name: true, slug: true, emailVerified: true },
    });

    if (!author) {
      return NextResponse.redirect(new URL("/verify-email/invalid", req.url));
    }

    // Mark email as verified and clear the token
    await prisma.author.update({
      where: { id: author.id },
      data: {
        emailVerified: new Date(),
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    // Send welcome email only on first verification
    if (!author.emailVerified) {
      sendWelcomeEmail(author.email, author.name, author.slug).catch((err) => {
        console.error("[verify-email] Failed to send welcome email:", err);
      });
    }

    return NextResponse.redirect(new URL("/verify-email/success", req.url));
  } catch (err) {
    console.error("[verify-email] Error:", err);
    return NextResponse.redirect(new URL("/verify-email/invalid", req.url));
  }
}
