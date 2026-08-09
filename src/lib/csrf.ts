import { createHash } from "crypto";

/**
 * Returns the secret used to sign CSRF tokens.
 *
 * Throws if NEXTAUTH_SECRET is unset/empty so a misconfiguration fails LOUDLY
 * (request rejected) instead of silently falling back to an empty secret —
 * which would make CSRF tokens forgeable by anyone who knows the session id.
 * In any working deployment this is always set (NextAuth requires it), so this
 * never trips in normal operation.
 */
export function getCsrfSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "NEXTAUTH_SECRET is not set — refusing to generate or validate CSRF tokens with an empty secret."
    );
  }
  return secret;
}

/**
 * Generate a CSRF token from a session ID and secret.
 * This is deterministic so the server can validate it without storing state.
 */
export function generateCSRFToken(sessionId: string, secret: string): string {
  const hash = createHash("sha256").update(`${secret}:${sessionId}`).digest();
  return hash.toString("base64url");
}

/**
 * Validate a CSRF token against a session ID and secret.
 */
export function validateCSRFToken(
  token: string,
  sessionId: string,
  secret: string
): boolean {
  const expectedToken = generateCSRFToken(sessionId, secret);
  return token === expectedToken;
}
