import { prisma } from "@/lib/db";

export type LimitCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string; code: "DISABLED_ENV" | "DISABLED_DB" | "COST_CEILING" | "PLAN_NOT_ENTITLED" | "DAILY_LIMIT" | "MONTHLY_LIMIT" };

/** Checks env-level + DB-level kill switches + today's cost ceiling. Platform-wide. */
export async function checkPlatformAvailable(): Promise<LimitCheckResult> {
  if (process.env.SOCIAL_PROMOTE_KILL_SWITCH && process.env.SOCIAL_PROMOTE_KILL_SWITCH !== "false") {
    return {
      allowed: false,
      reason: "Social Promote is temporarily unavailable. Please check back later.",
      code:   "DISABLED_ENV",
    };
  }

  const settings = await prisma.socialPromoteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });

  if (!settings.enabled) {
    return {
      allowed: false,
      reason: "Social Promote is temporarily unavailable. Please check back later.",
      code:   "DISABLED_DB",
    };
  }

  // Cost ceiling check — today's spend (UTC midnight).
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const todaySpend = await prisma.generatedSocialPost.aggregate({
    where: { createdAt: { gte: startOfDay } },
    _sum:  { costMicroCents: true },
  });
  // costMicroCents → cents: divide by 10,000
  const todayCents = (todaySpend._sum.costMicroCents ?? 0) / 10_000;
  if (todayCents >= settings.costDisableCentsPerDay) {
    return {
      allowed: false,
      reason: "Social Promote has hit today's cost ceiling and is temporarily paused. It will resume tomorrow.",
      code:   "COST_CEILING",
    };
  }

  return { allowed: true };
}

/** Checks the author's plan-tier daily + monthly generation limits. */
export async function checkAuthorEntitlement(authorId: string): Promise<LimitCheckResult> {
  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { plan: { select: { socialDailyLimit: true, socialMonthlyLimit: true, tier: true } } },
  });

  const dailyLimit   = author?.plan?.socialDailyLimit   ?? 0;
  const monthlyLimit = author?.plan?.socialMonthlyLimit ?? 0;

  if (dailyLimit <= 0) {
    return {
      allowed: false,
      reason: "Social Promote is available on Standard and Premium plans. Upgrade to start generating posts.",
      code:   "PLAN_NOT_ENTITLED",
    };
  }

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const [todayCount, monthCount] = await Promise.all([
    prisma.generatedSocialPost.count({
      where: { authorId, createdAt: { gte: startOfDay }, status: { in: ["SUCCESS"] } },
    }),
    prisma.generatedSocialPost.count({
      where: { authorId, createdAt: { gte: startOfMonth }, status: { in: ["SUCCESS"] } },
    }),
  ]);

  if (todayCount >= dailyLimit) {
    return {
      allowed: false,
      reason: `You've reached today's generation limit (${dailyLimit}). Limits reset at midnight UTC.`,
      code:   "DAILY_LIMIT",
    };
  }
  if (monthCount >= monthlyLimit) {
    return {
      allowed: false,
      reason: `You've reached this month's generation limit (${monthlyLimit}). Limits reset on the 1st.`,
      code:   "MONTHLY_LIMIT",
    };
  }

  return { allowed: true };
}
