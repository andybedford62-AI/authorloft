import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP to prevent abuse
    const rateLimitKey = getRateLimitKey(req, "ip", "forgot-password");
    const rateLimitResult = await checkRateLimit(rateLimitKey, RATE_LIMITS.auth);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalised = email.toLowerCase().trim();

    // Look up the author — but ALWAYS return the same success response
    // to prevent email enumeration attacks
    const author = await prisma.author.findUnique({
      where: { email: normalised },
      select: { id: true, email: true },
    });

    if (author) {
      // Generate a secure random token and store it (expires in 1 hour)
      const token = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.author.update({
        where: { id: author.id },
        data: {
          passwordResetToken: token,
          passwordResetExpiry: expiry,
        },
      });

      // Fire-and-forget — don't await so response isn't delayed
      sendPasswordResetEmail(author.email, token).catch((err) => {
        console.error("[forgot-password] Failed to send email:", err);
      });
    }

    // Always return 200 — prevents email enumeration
    return NextResponse.json({
      ok: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[forgot-password] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
