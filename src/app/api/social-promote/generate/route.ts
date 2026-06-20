import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/api-rate-limit";
import { checkPlatformAvailable, checkAuthorEntitlement } from "@/lib/social-promote/limits";
import { generateSocialPost } from "@/lib/social-promote/generate";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Coarse network-level rate limit (defence-in-depth alongside plan limits)
  const rl = await enforceRateLimit(req, { bucket: "ai", maxRequests: 20, windowSeconds: 60, userId: authorId });
  if (rl) return rl;

  // Platform-wide availability (env kill switch, DB kill switch, cost ceiling)
  const platformCheck = await checkPlatformAvailable();
  if (!platformCheck.allowed) {
    return NextResponse.json({ error: platformCheck.reason, code: platformCheck.code }, { status: 503 });
  }

  // Plan entitlement + per-author rate limits
  const entitlement = await checkAuthorEntitlement(authorId);
  if (!entitlement.allowed) {
    const status = entitlement.code === "PLAN_NOT_ENTITLED" ? 402 : 429;
    return NextResponse.json({ error: entitlement.reason, code: entitlement.code }, { status });
  }

  const body = await req.json().catch(() => ({} as any));
  const { platformSlug, promoTypeSlug, contextType, contextRefId, topicText } = body;

  if (!["book", "news", "topic"].includes(contextType)) {
    return NextResponse.json({ error: "Invalid context type." }, { status: 400 });
  }

  // Resolve slugs → ids (lets the client pass slugs which are stable & readable)
  const [platform, promoType] = await Promise.all([
    prisma.socialPromotePlatform.findUnique({ where: { slug: platformSlug ?? "" } }),
    prisma.socialPromoType.findUnique({ where: { slug: promoTypeSlug ?? "" } }),
  ]);
  if (!platform || !platform.isActive) {
    return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
  }
  if (!promoType || !promoType.isActive) {
    return NextResponse.json({ error: "Unknown promo type." }, { status: 400 });
  }

  // Premium gating for premium-only platforms
  if (platform.isPremiumOnly) {
    const authorPlan = await prisma.author.findUnique({
      where: { id: authorId },
      select: { plan: { select: { tier: true } } },
    });
    if (authorPlan?.plan?.tier !== "PREMIUM") {
      return NextResponse.json({ error: `${platform.name} requires a Premium plan.`, code: "PLAN_NOT_ENTITLED" }, { status: 402 });
    }
  }

  // Context restrictions (if the promo type has any)
  if (promoType.applicableContexts.length > 0 && !promoType.applicableContexts.includes(contextType)) {
    return NextResponse.json({ error: "This promo type can't be used with that context." }, { status: 400 });
  }
  if (promoType.applicablePlatforms.length > 0 && !promoType.applicablePlatforms.includes(platform.slug)) {
    return NextResponse.json({ error: "This promo type isn't available on that platform." }, { status: 400 });
  }

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;

  const result = await generateSocialPost({
    authorId,
    platformId:   platform.id,
    promoTypeId:  promoType.id,
    contextType:  contextType as "book" | "news" | "topic",
    contextRefId: contextRefId ?? null,
    topicText:    topicText    ?? null,
    ipAddress,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.userMessage, postId: result.postId }, { status: 500 });
  }

  return NextResponse.json({
    postId:      result.postId,
    outputText:  result.outputText,
    maxChars:    platform.maxChars,
    platform:    { slug: platform.slug, name: platform.name, hashtagStyle: platform.hashtagStyle },
    promoType:   { slug: promoType.slug, name: promoType.name },
  });
}
