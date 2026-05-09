import { createHash } from "crypto";

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
