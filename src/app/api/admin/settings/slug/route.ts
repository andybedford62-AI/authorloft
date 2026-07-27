import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { validateSlug, slugProblemMessage } from "@/lib/reserved-slugs";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getAuditContext } from "@/lib/audit-logger";

/**
 * GET  /api/admin/settings/slug — current site URL for the signed-in author
 * PATCH /api/admin/settings/slug — change it
 *
 * Signup no longer asks for a slug (it's derived from the author's name), so
 * this is where people set the URL they actually want once they've seen the
 * product. Changing it breaks any previously shared subdomain links, which the
 * UI warns about before submitting.
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authorId = (session.user as any).id as string;
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
  // shouldn't be cycled rapidly.
  const _rl = await enforceRateLimit(req, {
    bucket: "slug-change", maxRequests: 5, windowSeconds: 3600, userId: authorId,
  });
  if (_rl) return _rl;

  const body = await req.json().catch(() => ({}));
  const raw = typeof body.slug === "string" ? body.slug : "";
  const slug = slugify(raw);

  const problem = validateSlug(slug);
  if (problem) {
    return NextResponse.json({ error: slugProblemMessage(problem) }, { status: 400 });
  }

  const current = await prisma.author.findUnique({
    where: { id: authorId },
    select: { slug: true },
  });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (current.slug === slug) {
    return NextResponse.json({ ok: true, slug, unchanged: true });
  }

  const taken = await prisma.author.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (taken) {
    return NextResponse.json(
      { error: "That site URL is already taken. Please choose another." },
      { status: 409 }
    );
  }

  try {
    await prisma.author.update({ where: { id: authorId }, data: { slug } });
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

  return NextResponse.json({ ok: true, slug });
}
