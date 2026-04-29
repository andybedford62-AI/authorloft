// Per-email brute-force protection for the credentials login provider.
// In-memory, best-effort (same as the contact-form limiter). Each serverless
// instance tracks its own window, which is acceptable given the low volume.
const attempts = new Map<string, number[]>();
const WINDOW_MS  = 15 * 60 * 1000; // 15-minute sliding window
const MAX_ATTEMPTS = 5;

export function checkLoginRateLimit(email: string): boolean {
  const now  = Date.now();
  const key  = email.toLowerCase();
  const hits = (attempts.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_ATTEMPTS) return false;
  hits.push(now);
  attempts.set(key, hits);
  return true;
}
