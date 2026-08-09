import { checkRateLimit } from "./rate-limit";

const WINDOW_SECONDS = 15 * 60; // 15-minute sliding window
const MAX_ATTEMPTS = 5;

export async function checkLoginRateLimit(email: string): Promise<boolean> {
  const key = `rl:login:${email.toLowerCase()}`;
  const result = await checkRateLimit(key, {
    maxRequests: MAX_ATTEMPTS,
    windowSeconds: WINDOW_SECONDS,
  });
  return result.allowed;
}
