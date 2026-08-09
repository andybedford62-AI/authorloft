import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitKey } from "./rate-limit";

interface EnforceOpts {
  /** Namespace for the limit bucket, e.g. "reset-pw". Keeps unrelated routes separate. */
  bucket: string;
  maxRequests: number;
  windowSeconds: number;
  /** When provided, the limit is keyed per-user; otherwise it's keyed per client IP. */
  userId?: string | null;
}

/**
 * Enforce a rate limit on an API route.
 *
 * Returns a populated 429 NextResponse when the caller has exceeded the limit,
 * or `null` when the request may proceed. Backed by the shared `checkRateLimit`
 * (Redis when REDIS_URL is set, in-memory fallback otherwise).
 *
 * Usage:
 *   const limited = await enforceRateLimit(req, { bucket: "reset-pw", maxRequests: 10, windowSeconds: 900 });
 *   if (limited) return limited;
 */
export async function enforceRateLimit(
  req: NextRequest,
  opts: EnforceOpts
): Promise<NextResponse | null> {
  const key = opts.userId
    ? `rl:${opts.bucket}:user:${opts.userId}`
    : getRateLimitKey(req, "ip", opts.bucket);

  const { allowed, resetAt } = await checkRateLimit(key, {
    maxRequests: opts.maxRequests,
    windowSeconds: opts.windowSeconds,
  });

  if (allowed) return null;

  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { error: "Too many requests. Please wait a few minutes and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
