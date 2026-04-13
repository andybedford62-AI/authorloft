import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/mailer";

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const body = await req.json();
    const { name, email, password, slug: rawSlug } = body;

    // ── Field validation ────────────────────────────────────────────────────
    if (!name?.trim()) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
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
      select: { id: true },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists.", field: "email" },
        { status: 409 }
      );
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
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
