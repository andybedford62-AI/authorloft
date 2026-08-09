import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdminId } from "@/lib/super-admin-auth";
import { checkPlatformAvailable } from "@/lib/social-promote/limits";
import { generateSocialPost } from "@/lib/social-promote/generate";
import { prisma } from "@/lib/db";

/** Super Admin test-live endpoint. Skips plan/rate limits but still respects platform availability and cost ceiling. */
export async function POST(req: NextRequest) {
  const adminId = await requireSuperAdminId();
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const platformCheck = await checkPlatformAvailable();
  if (!platformCheck.allowed) {
    return NextResponse.json({ error: platformCheck.reason, code: platformCheck.code }, { status: 503 });
  }

  const body = await req.json().catch(() => ({} as any));
  const {
    platformSlug, promoTypeSlug, contextType, contextRefId, topicText,
    overridePromptTemplate, overridePromptAddendum, overrideVoice,
  } = body;

  if (!["book", "news", "topic"].includes(contextType)) {
    return NextResponse.json({ error: "Invalid context type." }, { status: 400 });
  }

  const [platform, promoType] = await Promise.all([
    prisma.socialPromotePlatform.findUnique({ where: { slug: platformSlug ?? "" } }),
    prisma.socialPromoType.findUnique({ where: { slug: promoTypeSlug ?? "" } }),
  ]);
  if (!platform)  return NextResponse.json({ error: "Unknown platform." },  { status: 400 });
  if (!promoType) return NextResponse.json({ error: "Unknown promo type." }, { status: 400 });

  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const result = await generateSocialPost({
    authorId:     adminId,
    platformId:   platform.id,
    promoTypeId:  promoType.id,
    contextType:  contextType as "book" | "news" | "topic",
    contextRefId: contextRefId ?? null,
    topicText:    topicText    ?? null,
    ipAddress,
    overrides: {
      promptTemplate: overridePromptTemplate || undefined,
      promptAddendum: overridePromptAddendum || undefined,
      voiceOverride:  overrideVoice          || undefined,
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.userMessage, detail: result.errorDetail, postId: result.postId }, { status: 500 });
  }

  return NextResponse.json({
    postId:          result.postId,
    outputText:      result.outputText,
    assembledPrompt: result.assembledPrompt,
    inputTokens:     result.inputTokens,
    outputTokens:    result.outputTokens,
    costMicroCents:  result.costMicroCents,
    modelUsed:       result.modelUsed,
    maxChars:        platform.maxChars,
  });
}
