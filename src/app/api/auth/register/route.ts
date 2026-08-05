import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { sendVerificationEmail, sendNewSignupNotificationEmail } from "@/lib/mailer";
import { passwordStrengthError } from "@/lib/password-validation";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { capturePostHog } from "@/lib/posthog";
import { RESERVED_SLUGS } from "@/lib/reserved-slugs";
import { checkSlugAvailability, slugUnavailableMessage } from "@/lib/slug-availability";

// ── Validation helpers ────────────────────────────────────────────────────────

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Derives a usable, unique slug from a display name. The signup form no longer
 * asks for one — people pick their real site URL later in Settings — so this
 * has to cope with names that don't slugify cleanly (too short, empty, or
 * colliding with a reserved word) as well as ordinary collisions.
 */
async function uniqueSlug(rawBase: string): Promise<string> {
  let base = rawBase;
  if (base.length < 3 || RESERVED_SLUGS.includes(base)) {
    base = base ? `${base}-author` : "author";
  }
  base = base.slice(0, 34); // leave headroom for a numeric suffix

  let candidate = base;
  let attempt = 2;
  // checkSlugAvailability also rejects slugs retired by a previous author,
  // which stay claimed so their redirects keep working.
  while ((await checkSlugAvailability(candidate)) !== null) {
    candidate = `${base}${attempt++}`;
    if (attempt > 500) {
      candidate = `${base}-${randomBytes(4).toString("hex")}`;
      break;
    }
  }
  return candidate;
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Rate limit ──────────────────────────────────────────────────────────
    const rlKey = getRateLimitKey(req, "ip", "register");
    const rl = await checkRateLimit(rlKey, { maxRequests: 5, windowSeconds: 3600 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, password, slug: rawSlug, termsAccepted, inviteCode } = body;

    // ── Beta mode invite-code check ─────────────────────────────────────────
    const sysConfig = await prisma.systemConfig.findUnique({
      where:  { id: "main" },
      select: { betaMode: true },
    });
    if (sysConfig?.betaMode) {
      if (!inviteCode?.trim()) {
        return NextResponse.json(
          { error: "An invite code is required to register during beta.", field: "inviteCode" },
          { status: 403 }
        );
      }
      const code = await prisma.inviteCode.findUnique({
        where: { code: inviteCode.trim().toUpperCase() },
      });
      if (!code) {
        return NextResponse.json(
          { error: "Invalid invite code. Please check and try again.", field: "inviteCode" },
          { status: 403 }
        );
      }
      if (code.usesCount >= code.maxUses) {
        return NextResponse.json(
          { error: "This invite code has already been used.", field: "inviteCode" },
          { status: 403 }
        );
      }
      if (code.expiresAt && code.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "This invite code has expired.", field: "inviteCode" },
          { status: 403 }
        );
      }
      // Increment usage count now — before account creation so race conditions
      // can't result in over-use. Account creation failure is tolerable; double
      // use is not.
      await prisma.inviteCode.update({
        where: { id: code.id },
        data:  { usesCount: { increment: 1 } },
      });
    }

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
    // The signup form no longer collects a slug — it's derived from the name and
    // changed later in Settings. An explicit slug is still honoured (direct API
    // callers) but must pass full validation, including the reserved list.
    if (rawSlug) {
      const reason = await checkSlugAvailability(slugify(rawSlug));
      if (reason) {
        const status = reason === "taken" || reason === "retired" ? 409 : 400;
        return NextResponse.json(
          { error: slugUnavailableMessage(reason), field: "slug" },
          { status }
        );
      }
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

    // An explicit slug was validated above; a derived one auto-resolves collisions.
    const finalSlug = rawSlug
      ? slugify(rawSlug)
      : await uniqueSlug(slugify(name.trim()));

    // ── Create account ──────────────────────────────────────────────────────
    capturePostHog(email.toLowerCase().trim(), "signup_started", { signup_method: "email" });

    const passwordHash = await hashPassword(password);

    // Look up the FREE plan and global AI cap default in parallel
    const [freePlan, sysDefaults] = await Promise.all([
      prisma.plan.findFirst({ where: { tier: "FREE" }, select: { id: true } }),
      prisma.systemConfig.findUnique({ where: { id: "main" }, select: { defaultAiUsageCap: true } }),
    ]);
    const aiUsageCap = sysDefaults?.defaultAiUsageCap ?? 20;

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
        termsAcceptedAt: new Date(),
        aiUsageCap: aiUsageCap,
        contactEmail: email.toLowerCase().trim(),
        ...(freePlan && { planId: freePlan.id }),
      },
    });

    capturePostHog(author.id, "signup_completed", { signup_method: "email", plan_tier: "FREE", slug: author.slug });

    // Send verification email (fire-and-forget — don't block the response)
    sendVerificationEmail(author.email, emailVerifyToken).catch((err) => {
      console.error("[register] Failed to send verification email:", err);
    });

    // Send admin signup notification if enabled (fire-and-forget)
    prisma.systemConfig.findUnique({ where: { id: "main" }, select: { newSignupNotifications: true, signupNotificationEmail: true } })
      .then((cfg) => {
        if (cfg?.newSignupNotifications && cfg.signupNotificationEmail) {
          sendNewSignupNotificationEmail({
            to:          cfg.signupNotificationEmail,
            authorName:  author.name,
            authorEmail: author.email,
            slug:        author.slug,
            method:      "email",
          }).catch((err) => console.error("[register] Failed to send signup notification:", err));
        }
      })
      .catch(() => {});

    return NextResponse.json({ ok: true, slug: finalSlug });
  } catch (err) {
    console.error("[register] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
