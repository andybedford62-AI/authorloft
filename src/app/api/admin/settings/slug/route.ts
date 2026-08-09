import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { checkSlugAvailability, slugUnavailableMessage } from "@/lib/slug-availability";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getAuditContext } from "@/lib/audit-logger";

/**
 * GET   /api/admin/settings/slug            — current site URL
 * GET   /api/admin/settings/slug?check=foo  — availability, scoped to this author
 *                                             (so they can reclaim their own retired slug)
 * PATCH /api/admin/settings/slug            — change it
 *
 * The previous slug is recorded in AuthorSlugHistory so requests to it keep
 * 301-redirecting to the new address — old links, backlinks, and search
 * rankings survive the change.
 */

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;

  const check = req.nextUrl.searchParams.get("check");
  if (check !== null) {
    const slug = slugify(check);
    const reason = await checkSlugAvailability(slug, { forAuthorId: authorId });
    return NextResponse.json({
      available: !reason,
      slug,
      ...(reason && { reason, message: slugUnavailableMessage(reason) }),
    });
  }

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { slug: true, customDomain: true },
  });
  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(author);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;

  // Tighter than the general admin bucket — slug changes churn public URLs and
  // each one permanently retires the old address.
  const _rl = await enforceRateLimit(req, {
    bucket: "slug-change", maxRequests: 5, windowSeconds: 3600, userId: authorId,
  });
  if (_rl) return _rl;

  const body = await req.json().catch(() => ({}));
  const raw = typeof body.slug === "string" ? body.slug : "";
  const slug = slugify(raw);

  const current = await prisma.author.findUnique({
    where: { id: authorId },
    select: { slug: true },
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (current.slug === slug) {
    return NextResponse.json({ ok: true, slug, unchanged: true });
  }

  const reason = await checkSlugAvailability(slug, { forAuthorId: authorId });
  if (reason) {
    const status = reason === "taken" || reason === "retired" ? 409 : 400;
    return NextResponse.json({ error: slugUnavailableMessage(reason) }, { status });
  }

  try {
    await prisma.$transaction([
      // Reclaiming one of their own retired slugs — free it from history first
      prisma.authorSlugHistory.deleteMany({ where: { slug, authorId } }),
      // Retire the outgoing slug so it keeps redirecting here
      prisma.authorSlugHistory.create({ data: { authorId, slug: current.slug } }),
      prisma.author.update({ where: { id: authorId }, data: { slug } }),
    ]);
  } catch {
    // Unique constraint can still trip if someone claimed it in between
    return NextResponse.json(
      { error: "That site URL was just taken. Please choose another." },
      { status: 409 }
    );
  }

  auditLog({
    userId: authorId,
    action: "Change site URL",
    endpoint: "/api/admin/settings/slug",
    method: "PATCH",
    statusCode: 200,
    ...getAuditContext(req),
    metadata: { from: current.slug, to: slug },
  });

  return NextResponse.json({ ok: true, slug, previousSlug: current.slug });
}
