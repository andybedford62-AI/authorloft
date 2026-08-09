import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { canUseFeature } from "@/lib/plan-limits";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { auditLog, getAuditContext } from "@/lib/audit-logger";
import { addDomain, getDomainStatus, removeDomain, VercelDomainError } from "@/lib/vercel-domains";

/**
 * Self-serve "bring your own domain" — an author who already owns a domain
 * links it here. We register it on the Vercel project, show them the DNS
 * records to add, and let them re-check status until it goes live.
 *
 * GET    /api/admin/settings/custom-domain             — current state
 * GET    /api/admin/settings/custom-domain?refresh=1    — re-poll Vercel, update status
 * POST   /api/admin/settings/custom-domain              — link a new domain
 * DELETE /api/admin/settings/custom-domain              — unlink (reverts to subdomain)
 */

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com";

// Basic hostname shape: labels of letters/digits/hyphens, at least one dot,
// no leading/trailing hyphen per label. Good enough to reject garbage before
// it ever reaches Vercel's API.
const DOMAIN_REGEX = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i;

function dnsInstructionsFor(domain: string) {
  const labels = domain.split(".");
  const isApex = labels.length === 2;
  return isApex
    ? { type: "A", name: "@", value: "76.76.21.21" }
    : { type: "CNAME", name: labels[0], value: "cname.vercel-dns.com" };
}

export async function GET(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const gate = await canUseFeature(authorId, "customDomain");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason, gated: true }, { status: 403 });

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { customDomain: true, customDomainStatus: true, customDomainVerification: true },
  });
  if (!author) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!author.customDomain) {
    return NextResponse.json({ domain: null });
  }

  const shouldRefresh = req.nextUrl.searchParams.get("refresh") !== null;
  let status = author.customDomainStatus;
  let misconfigured: boolean | null = null;

  if (shouldRefresh) {
    try {
      const result = await getDomainStatus(author.customDomain);
      misconfigured = result.misconfigured;
      status = result.verified && !result.misconfigured ? "VERIFIED" : "PENDING";
      await prisma.author.update({
        where: { id: authorId },
        data: { customDomainStatus: status, customDomainVerification: result.verification as unknown as Prisma.InputJsonValue },
      });
    } catch (err) {
      status = "ERROR";
      await prisma.author.update({ where: { id: authorId }, data: { customDomainStatus: status } });
    }
  }

  return NextResponse.json({
    domain: author.customDomain,
    status,
    verification: author.customDomainVerification,
    dnsInstructions: dnsInstructionsFor(author.customDomain),
    misconfigured,
  });
}

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const _rl = await enforceRateLimit(req, {
    bucket: "custom-domain-link", maxRequests: 10, windowSeconds: 3600, userId: authorId,
  });
  if (_rl) return _rl;

  const gate = await canUseFeature(authorId, "customDomain");
  if (!gate.allowed) return NextResponse.json({ error: gate.reason }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const domain = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";

  if (!domain || !DOMAIN_REGEX.test(domain)) {
    return NextResponse.json({ error: "Enter a valid domain, e.g. yourname.com" }, { status: 400 });
  }
  if (domain === PLATFORM_DOMAIN || domain.endsWith(`.${PLATFORM_DOMAIN}`)) {
    return NextResponse.json({ error: "That domain is reserved for AuthorLoft." }, { status: 400 });
  }

  const existing = await prisma.author.findUnique({ where: { customDomain: domain }, select: { id: true } });
  if (existing && existing.id !== authorId) {
    return NextResponse.json({ error: "That domain is already linked to another site." }, { status: 409 });
  }

  let result;
  try {
    result = await addDomain(domain);
  } catch (err) {
    const message = err instanceof VercelDomainError ? err.message : "Could not link that domain. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Ownership verification (result.verified) is separate from DNS actually
  // pointing at Vercel — always start Pending until a status refresh confirms both.
  const status = "PENDING";
  await prisma.author.update({
    where: { id: authorId },
    data: {
      customDomain: domain,
      customDomainStatus: status,
      customDomainVerification: result.verification as unknown as Prisma.InputJsonValue,
      customDomainAddedAt: new Date(),
    },
  });

  auditLog({
    userId: authorId,
    action: "Link custom domain",
    endpoint: "/api/admin/settings/custom-domain",
    method: "POST",
    statusCode: 200,
    ...getAuditContext(req),
    metadata: { domain },
  });

  return NextResponse.json({
    domain,
    status,
    verification: result.verification,
    dnsInstructions: dnsInstructionsFor(domain),
  });
}

export async function DELETE(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const author = await prisma.author.findUnique({ where: { id: authorId }, select: { customDomain: true } });
  if (!author?.customDomain) {
    return NextResponse.json({ error: "No custom domain linked." }, { status: 400 });
  }

  try {
    await removeDomain(author.customDomain);
  } catch (err) {
    // Domain may already be gone on Vercel's side — don't block the author
    // from unlinking it on our end just because the remote call failed.
    if (!(err instanceof VercelDomainError && err.code === "not_found")) {
      console.error("[custom-domain] Vercel removal failed:", err);
    }
  }

  await prisma.author.update({
    where: { id: authorId },
    data: {
      customDomain: null,
      customDomainStatus: null,
      customDomainVerification: Prisma.JsonNull,
      customDomainAddedAt: null,
    },
  });

  auditLog({
    userId: authorId,
    action: "Unlink custom domain",
    endpoint: "/api/admin/settings/custom-domain",
    method: "DELETE",
    statusCode: 200,
    ...getAuditContext(req),
    metadata: { domain: author.customDomain },
  });

  return NextResponse.json({ ok: true });
}
