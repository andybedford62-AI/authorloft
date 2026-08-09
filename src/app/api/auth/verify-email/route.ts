import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/mailer";
import { capturePostHog } from "@/lib/posthog";
import { enforceRateLimit } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  // Defence-in-depth: cap token-guessing attempts per IP (redirect to the
  // invalid page on abuse rather than leak a distinct rate-limit signal).
  const limited = await enforceRateLimit(req, { bucket: "verify-email", maxRequests: 20, windowSeconds: 900 });
  if (limited) return NextResponse.redirect(new URL("/verify-email/invalid", req.url));

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
      select: { id: true, email: true, name: true, slug: true, emailVerified: true, createdAt: true },
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

    // Only fire on first verification (emailVerified was null before the update above)
    if (!author.emailVerified) {
      const hoursSinceSignup = Math.round((Date.now() - new Date(author.createdAt).getTime()) / (1000 * 60 * 60));
      capturePostHog(author.id, "email_verified", { hours_since_signup: hoursSinceSignup });
    }

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
