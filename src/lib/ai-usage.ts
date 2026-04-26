import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encrypt";

export interface AiContext {
  apiKey:      string;       // resolved key to use (own or platform)
  hasOwnKey:   boolean;
  usageCount:  number;
  usageCap:    number;
  atLimit:     boolean;
  planAllowed: boolean;      // true only for PREMIUM plan
}

/** Returns null if author not found or no usable API key available. */
export async function getAiContext(authorId: string): Promise<AiContext | null> {
  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: { aiApiKey: true, aiUsageCount: true, aiUsageCap: true, aiUsageResetAt: true, plan: { select: { tier: true } } },
  });

  if (!author) return null;

  // Auto-reset counter if 30+ days have passed
  const now          = new Date();
  const resetAt      = author.aiUsageResetAt;
  const msPerDay     = 1000 * 60 * 60 * 24;
  const daysSinceReset = resetAt ? (now.getTime() - resetAt.getTime()) / msPerDay : Infinity;

  let usageCount = author.aiUsageCount;

  if (daysSinceReset >= 30) {
    await prisma.author.update({
      where: { id: authorId },
      data:  { aiUsageCount: 0, aiUsageResetAt: now },
    });
    usageCount = 0;
  }

  const hasOwnKey     = !!author.aiApiKey;
  const platformKey   = process.env.GEMINI_API_KEY ?? "";
  const resolvedKey   = hasOwnKey ? decrypt(author.aiApiKey!) : platformKey;
  const atLimit       = !hasOwnKey && usageCount >= author.aiUsageCap;
  const planAllowed   = (author.plan?.tier ?? "FREE") === "PREMIUM";

  if (!resolvedKey) return null;

  return {
    apiKey:      resolvedKey,
    hasOwnKey,
    usageCount,
    usageCap:    author.aiUsageCap,
    atLimit,
    planAllowed,
  };
}

export async function incrementUsage(authorId: string) {
  await prisma.author.update({
    where: { id: authorId },
    data:  { aiUsageCount: { increment: 1 } },
  });
}
