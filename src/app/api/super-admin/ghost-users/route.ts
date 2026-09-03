import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOnboardingReminderEmail } from "@/lib/mailer";
import { requireSuperAdminId } from "@/lib/super-admin-auth";

// GET /api/super-admin/ghost-users
// Returns all verified authors with no books and no onboardingCompletedAt
export async function GET(req: NextRequest) {
  if (!await requireSuperAdminId()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ghosts = await prisma.author.findMany({
    where: {
      isSuperAdmin:          false,
      onboardingCompletedAt: null,
      emailVerified:         { not: null },
      books:                 { none: {} },
    },
    select: {
      id:                       true,
      name:                     true,
      displayName:              true,
      email:                    true,
      slug:                     true,
      emailVerified:            true,
      onboardingReminderSentAt: true,
    },
    orderBy: { emailVerified: "asc" },
  });

  return NextResponse.json(ghosts.map((g) => ({
    ...g,
    emailVerified:            g.emailVerified?.toISOString() ?? null,
    onboardingReminderSentAt: g.onboardingReminderSentAt?.toISOString() ?? null,
  })));
}

// POST /api/super-admin/ghost-users  { action: "remind" | "delete", authorId }
export async function POST(req: NextRequest) {
  if (!await requireSuperAdminId()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, authorId } = await req.json();
  if (!authorId) return NextResponse.json({ error: "authorId required" }, { status: 400 });

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { id: true, email: true, name: true, displayName: true, slug: true, isSuperAdmin: true, onboardingCompletedAt: true, creatorType: true },
  });

  if (!author || author.isSuperAdmin || author.onboardingCompletedAt) {
    return NextResponse.json({ error: "Not a ghost account" }, { status: 404 });
  }

  if (action === "remind") {
    const name = author.displayName || author.name;
    await sendOnboardingReminderEmail(author.email, name, author.slug, author.creatorType);
    await prisma.author.update({
      where: { id: authorId },
      data:  { onboardingReminderSentAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "delete") {
    await prisma.author.delete({ where: { id: authorId } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
