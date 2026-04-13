import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
      select: { id: true, emailVerified: true },
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

    return NextResponse.redirect(new URL("/verify-email/success", req.url));
  } catch (err) {
    console.error("[verify-email] Error:", err);
    return NextResponse.redirect(new URL("/verify-email/invalid", req.url));
  }
}
