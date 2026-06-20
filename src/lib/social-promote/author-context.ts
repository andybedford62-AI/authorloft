import { prisma } from "@/lib/db";

export type AuthorPromoteContext = {
  enabled:       boolean;            // platform-level kill switch state (env or DB)
  costCeilingHit:boolean;            // today's cost ceiling reached
  planTier:      "FREE" | "STANDARD" | "PREMIUM";
  planAllowed:   boolean;            // tier allows the feature at all (STANDARD or PREMIUM)
  dailyLimit:    number;
  monthlyLimit:  number;
  todayCount:    number;
  monthCount:    number;
  voice:         string | null;
  platforms: Array<{
    id: string;
    slug: string;
    name: string;
    maxChars: number;
    hashtagStyle: string;
    isPremiumOnly: boolean;
    accessible: boolean;             // true if author can use it on their plan
  }>;
  promoTypes: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    applicableContexts: string[];
    applicablePlatforms: string[];
  }>;
  books: Array<{ id: string; title: string; subtitle: string | null }>;
};

export async function loadAuthorPromoteContext(authorId: string): Promise<AuthorPromoteContext> {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);

  const [
    author,
    settings,
    activePlatforms,
    activePromoTypes,
    books,
    todayCount,
    monthCount,
    todaySpend,
  ] = await Promise.all([
    prisma.author.findUnique({
      where: { id: authorId },
      select: { socialVoiceDescription: true, plan: { select: { tier: true, socialDailyLimit: true, socialMonthlyLimit: true } } },
    }),
    prisma.socialPromoteSettings.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } }),
    prisma.socialPromotePlatform.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.socialPromoType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.book.findMany({
      where:  { authorId, isPublished: true },
      select: { id: true, title: true, subtitle: true },
      orderBy: { title: "asc" },
    }),
    prisma.generatedSocialPost.count({ where: { authorId, createdAt: { gte: startOfDay },   status: "SUCCESS" } }),
    prisma.generatedSocialPost.count({ where: { authorId, createdAt: { gte: startOfMonth }, status: "SUCCESS" } }),
    prisma.generatedSocialPost.aggregate({ where: { createdAt: { gte: startOfDay } }, _sum: { costMicroCents: true } }),
  ]);

  const planTier = (author?.plan?.tier ?? "FREE") as "FREE" | "STANDARD" | "PREMIUM";
  const isPremium = planTier === "PREMIUM";

  const envKill = !!process.env.SOCIAL_PROMOTE_KILL_SWITCH && process.env.SOCIAL_PROMOTE_KILL_SWITCH !== "false";
  const todayCents = (todaySpend._sum.costMicroCents ?? 0) / 10_000;
  const costCeilingHit = todayCents >= settings.costDisableCentsPerDay;

  return {
    enabled:        !envKill && settings.enabled,
    costCeilingHit,
    planTier,
    planAllowed:    planTier !== "FREE",
    dailyLimit:     author?.plan?.socialDailyLimit   ?? 0,
    monthlyLimit:   author?.plan?.socialMonthlyLimit ?? 0,
    todayCount,
    monthCount,
    voice:          author?.socialVoiceDescription ?? null,
    platforms:      activePlatforms.map((p) => ({
      id: p.id, slug: p.slug, name: p.name, maxChars: p.maxChars,
      hashtagStyle: p.hashtagStyle, isPremiumOnly: p.isPremiumOnly,
      accessible: !p.isPremiumOnly || isPremium,
    })),
    promoTypes:     activePromoTypes.map((t) => ({
      id: t.id, slug: t.slug, name: t.name, description: t.description,
      applicableContexts: t.applicableContexts, applicablePlatforms: t.applicablePlatforms,
    })),
    books,
  };
}
