import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/mailer";

// ── Rate limiting (in-memory, best-effort for serverless) ─────────────────────
const registrationAttempts = new Map<string, number[]>();
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX       = 5;

function checkRateLimit(ip: string): boolean {
  const now      = Date.now();
  const attempts = (registrationAttempts.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  if (attempts.length >= RATE_MAX) return false;
  attempts.push(now);
  registrationAttempts.set(ip, attempts);
  return true;
}

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordStrengthError(pw: string): string | null {
  if (pw.length < 8)          return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw))      return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(pw))      return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must contain at least one special character (!@#$… etc).";
  return null;
}

function isValidSlug(slug: string) {
  return /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug);
}

// Ensure a slug is unique — appends a number if taken (e.g. janedoe → janedoe2)
async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let attempt = 2;
  while (await prisma.author.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}${attempt++}`;
  }
  return candidate;
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Rate limit ──────────────────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password, slug: rawSlug, termsAccepted } = body;

    // ── Field validation ────────────────────────────────────────────────────
    if (!termsAccepted) {
      return NextResponse.json(
        { error: "You must accept the Terms of Service and Privacy Policy to create an account." },
        { status: 400 }
      );
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    const pwError = passwordStrengthError(password ?? "");
    if (pwError) {
      return NextResponse.json({ error: pwError }, { status: 400 });
    }

    // ── Slug handling ───────────────────────────────────────────────────────
    const slugBase = rawSlug
      ? slugify(rawSlug)
      : slugify(name.trim());

    if (!slugBase || slugBase.length < 3) {
      return NextResponse.json(
        { error: "Could not generate a valid site URL from your name. Please enter one manually." },
        { status: 400 }
      );
    }

    if (rawSlug && !isValidSlug(slugBase)) {
      return NextResponse.json(
        { error: "Site URL may only contain lowercase letters, numbers, and hyphens (3–40 characters)." },
        { status: 400 }
      );
    }

    // ── Uniqueness checks ───────────────────────────────────────────────────
    const existingEmail = await prisma.author.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, emailVerified: true, emailVerifyExpiry: true },
    });

    if (existingEmail) {
      // Allow re-registration if the prior account was never verified and its
      // verification window has now expired — purge the ghost record and continue.
      const isAbandonedUnverified =
        !existingEmail.emailVerified &&
        existingEmail.emailVerifyExpiry &&
        existingEmail.emailVerifyExpiry < new Date();

      if (isAbandonedUnverified) {
        await prisma.author.delete({ where: { id: existingEmail.id } });
      } else {
        return NextResponse.json(
          { error: "An account with this email already exists.", field: "email" },
          { status: 409 }
        );
      }
    }

    // If the user supplied a specific slug, check it's free — otherwise auto-increment
    const finalSlug = rawSlug
      ? slugBase
      : await uniqueSlug(slugBase);

    const existingSlug = await prisma.author.findUnique({
      where: { slug: finalSlug },
      select: { id: true },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "This site URL is already taken. Please choose another.", field: "slug" },
        { status: 409 }
      );
    }

    // ── Create account ──────────────────────────────────────────────────────
    const passwordHash = await hashPassword(password);

    // Look up the FREE plan (may not be seeded in all environments — that's OK)
    const freePlan = await prisma.plan.findFirst({
      where: { tier: "FREE" },
      select: { id: true },
    });

    // Generate an email verification token (expires in 24 hours)
    const emailVerifyToken = randomBytes(32).toString("hex");
    const emailVerifyExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const author = await prisma.author.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        displayName: name.trim(),
        slug: finalSlug,
        isActive: true,
        emailVerifyToken,
        emailVerifyExpiry,
        termsAcceptedAt: new Date(),
        ...(freePlan && { planId: freePlan.id }),
      },
    });

    // Send verification email (fire-and-forget — don't block the response)
    sendVerificationEmail(author.email, emailVerifyToken).catch((err) => {
      console.error("[register] Failed to send verification email:", err);
    });

    return NextResponse.json({ ok: true, slug: finalSlug });
  } catch (err) {
    console.error("[register] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
