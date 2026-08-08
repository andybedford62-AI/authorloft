/**
 * Vercel Domains API client — lets an author link a domain they already own
 * to their AuthorLoft site. Two separate Vercel-side checks matter here:
 *   - `verified`      → ownership proven (TXT record), only needed if Vercel
 *                        flags the domain as contested/ambiguous on add.
 *   - `misconfigured`  → whether the domain's DNS currently points at Vercel
 *                        (A/CNAME records), i.e. whether traffic actually routes.
 * Both are surfaced so the UI can tell an author exactly what's left to do.
 */

const VERCEL_API_BASE = "https://api.vercel.com";

export class VercelDomainError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "VercelDomainError";
  }
}

// This project lives under a Vercel team, so VERCEL_TEAM_ID is required in
// practice — without it, Vercel's API can't tell which account's project the
// domain calls are for and will reject them even with a valid token.
function teamQuery(): string {
  const teamId = process.env.VERCEL_TEAM_ID;
  return teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
}

function headers(): HeadersInit {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) {
    throw new VercelDomainError("VERCEL_API_TOKEN is not configured.");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function vercelFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${VERCEL_API_BASE}${path}`, { ...init, headers: headers() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new VercelDomainError(
      body?.error?.message || `Vercel API error (${res.status})`,
      body?.error?.code
    );
  }
  return body;
}

export interface VercelDomainVerificationRecord {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

export interface AddDomainResult {
  verified: boolean;
  verification: VercelDomainVerificationRecord[];
}

export interface DomainStatusResult {
  verified: boolean;
  verification: VercelDomainVerificationRecord[];
  misconfigured: boolean;
}

/** Registers a domain on the Vercel project. Idempotent — re-adding an
 * already-added domain just returns its current state. */
export async function addDomain(domain: string): Promise<AddDomainResult> {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) throw new VercelDomainError("VERCEL_PROJECT_ID is not configured.");

  const body = await vercelFetch(`/v10/projects/${projectId}/domains${teamQuery()}`, {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  });

  return {
    verified: !!body.verified,
    verification: body.verification || [],
  };
}

/** Checks both ownership verification and live DNS configuration. */
export async function getDomainStatus(domain: string): Promise<DomainStatusResult> {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) throw new VercelDomainError("VERCEL_PROJECT_ID is not configured.");

  const [domainInfo, config] = await Promise.all([
    vercelFetch(`/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}${teamQuery()}`),
    vercelFetch(`/v6/domains/${encodeURIComponent(domain)}/config${teamQuery()}`),
  ]);

  return {
    verified: !!domainInfo.verified,
    verification: domainInfo.verification || [],
    misconfigured: !!config.misconfigured,
  };
}

/** Removes the domain from the Vercel project. Safe to call even if the
 * domain was never fully verified/configured. */
export async function removeDomain(domain: string): Promise<void> {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) throw new VercelDomainError("VERCEL_PROJECT_ID is not configured.");

  await vercelFetch(`/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}${teamQuery()}`, {
    method: "DELETE",
  });
}
