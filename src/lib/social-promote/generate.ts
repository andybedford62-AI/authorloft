import { GoogleGenerativeAI } from "@google/generative-ai";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { calcCostMicroCents } from "./pricing";
import { assemblePrompt, type AssemblyInputs } from "./prompt-assembly";
import { checkCostCeilingsAfterGen } from "./cost-alerts";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { releaseLabel, taggedUrl } from "@/lib/music-share";

export type GenerateRequest = {
  authorId:      string;
  platformId:    string;
  promoTypeId:   string;
  contextType:   "book" | "news" | "topic" | "music";
  contextRefId:  string | null;
  topicText:     string | null;
  ipAddress:     string | null;
  // Optional overrides used by the Super Admin "test live" flow.
  overrides?: {
    promptTemplate?: string;
    promptAddendum?: string;
    voiceOverride?:  string;
  };
};

export type GenerateResult =
  | { ok: true;  postId: string; outputText: string; assembledPrompt: string; inputTokens: number; outputTokens: number; costMicroCents: number; modelUsed: string }
  | { ok: false; postId: string | null; status: "FAILED" | "BLOCKED"; userMessage: string; errorDetail: string };

/** Google's "busy" answers (503 high demand / 429 rate limit) — worth a retry,
 *  unlike a bad key or a blocked prompt. */
export function isTransientAiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /\b(503|429)\b|overloaded|high demand|UNAVAILABLE|RESOURCE_EXHAUSTED/i.test(msg);
}

/** Separate-capacity model tried last when the configured one stays busy. */
const FALLBACK_MODEL = "gemini-2.5-flash";

/** Core generation function. Logs to GeneratedSocialPost on both success AND failure. */
export async function generateSocialPost(req: GenerateRequest): Promise<GenerateResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      ok: false, postId: null, status: "FAILED",
      userMessage: "AI service is not configured. Please contact support.",
      errorDetail: "GEMINI_API_KEY missing",
    };
  }

  // Load everything needed in parallel
  const [settings, platform, promoType, author] = await Promise.all([
    prisma.socialPromoteSettings.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } }),
    prisma.socialPromotePlatform.findUnique({ where: { id: req.platformId } }),
    prisma.socialPromoType.findUnique({ where: { id: req.promoTypeId } }),
    prisma.author.findUnique({
      where: { id: req.authorId },
      select: { id: true, name: true, displayName: true, socialVoiceDescription: true },
    }),
  ]);

  if (!platform || !platform.isActive) {
    return { ok: false, postId: null, status: "FAILED", userMessage: "That platform is no longer available.", errorDetail: "Platform missing or inactive" };
  }
  if (!promoType || !promoType.isActive) {
    return { ok: false, postId: null, status: "FAILED", userMessage: "That promo type is no longer available.", errorDetail: "PromoType missing or inactive" };
  }
  if (!author) {
    return { ok: false, postId: null, status: "FAILED", userMessage: "Author not found.", errorDetail: "Author missing" };
  }

  // Resolve context (look up book if needed)
  let assemblyContext: AssemblyInputs["context"];
  let contextSummary: string;

  if (req.contextType === "book") {
    if (!req.contextRefId) {
      return { ok: false, postId: null, status: "FAILED", userMessage: "Please pick a book.", errorDetail: "contextRefId required for book context" };
    }
    const book = await prisma.book.findFirst({
      where: { id: req.contextRefId, authorId: req.authorId },
      select: { title: true, subtitle: true, shortDescription: true, description: true },
    });
    if (!book) {
      return { ok: false, postId: null, status: "FAILED", userMessage: "Book not found.", errorDetail: "Book missing or not owned" };
    }
    assemblyContext = { type: "book", book };
    contextSummary  = book.title;
  } else if (req.contextType === "music") {
    if (!req.contextRefId) {
      return { ok: false, postId: null, status: "FAILED", userMessage: "Please pick a music release.", errorDetail: "contextRefId required for music context" };
    }
    // Published only: the post links to the public page, which 404s for a draft.
    const [list, site] = await Promise.all([
      prisma.course.findFirst({
        where:  { id: req.contextRefId, authorId: req.authorId, kind: "MUSIC", isPublished: true },
        select: {
          title: true, slug: true, description: true, releaseType: true, releaseDate: true,
          modules: { orderBy: { sortOrder: "asc" }, select: { lessons: { orderBy: { sortOrder: "asc" }, select: { title: true } } } },
        },
      }),
      prisma.author.findUnique({ where: { id: req.authorId }, select: { slug: true, customDomain: true } }),
    ]);
    if (!list || !site) {
      return { ok: false, postId: null, status: "FAILED", userMessage: "Music release not found.", errorDetail: "Music list missing, unpublished or not owned" };
    }
    assemblyContext = {
      type: "music",
      music: {
        title:        list.title,
        releaseLabel: releaseLabel(list.releaseType),
        releaseYear:  list.releaseDate?.getUTCFullYear() ?? null,
        description:  list.description,
        trackTitles:  list.modules.flatMap((m) => m.lessons.map((l) => l.title)),
        // Tagged with the platform so PostHog credits the network the post went out on.
        url: taggedUrl(`${getAuthorBaseUrl(site)}/music/${list.slug}`, platform.slug, list.slug),
      },
    };
    contextSummary = list.title;
  } else if (req.contextType === "news") {
    if (!req.contextRefId) {
      return { ok: false, postId: null, status: "FAILED", userMessage: "Please pick a news post.", errorDetail: "contextRefId required for news context" };
    }
    const news = await prisma.platformPost.findUnique({
      where:  { id: req.contextRefId },
      select: { title: true, excerpt: true, isNews: true, isPublished: true },
    });
    if (!news || !news.isNews || !news.isPublished) {
      return { ok: false, postId: null, status: "FAILED", userMessage: "News post not found.", errorDetail: "News post missing or not published" };
    }
    assemblyContext = { type: "news", news: { title: news.title, excerpt: news.excerpt } };
    contextSummary  = news.title;
  } else {
    const topic = (req.topicText ?? "").trim();
    if (!topic) {
      return { ok: false, postId: null, status: "FAILED", userMessage: "Please describe what you want to post about.", errorDetail: "topicText required for topic context" };
    }
    if (topic.length > 800) {
      return { ok: false, postId: null, status: "FAILED", userMessage: "Topic is too long (max 800 characters).", errorDetail: "topicText too long" };
    }
    assemblyContext = { type: "topic", topic };
    contextSummary  = topic.slice(0, 120);
  }

  // Apply any super-admin overrides
  const effectivePromoType = {
    name: promoType.name,
    promptTemplate: req.overrides?.promptTemplate ?? promoType.promptTemplate,
  };
  const effectivePlatform = {
    name: platform.name,
    maxChars: platform.maxChars,
    hashtagStyle: platform.hashtagStyle,
    promptAddendum: req.overrides?.promptAddendum ?? platform.promptAddendum,
  };
  const effectiveVoice = req.overrides?.voiceOverride ?? author.socialVoiceDescription;

  const assembledPrompt = assemblePrompt({
    platform:  effectivePlatform,
    promoType: effectivePromoType,
    author:    { displayName: author.displayName ?? author.name, voice: effectiveVoice ?? null },
    context:   assemblyContext,
  });

  // Call Gemini with a server-side timeout.
  const timeoutMs = settings.timeoutMs;
  const model    = settings.model;
  const maxTokens = settings.maxOutputTokens;

  let outputText = "";
  let inputTokens = 0;
  let outputTokens = 0;
  // The model that actually answered (or was last tried) — logged and priced.
  let modelUsed = model;

  try {
    const genAI  = new GoogleGenerativeAI(apiKey);

    // Gemini regularly returns 503 "high demand" for a few seconds at a time
    // (seen Sept 24 2026: two failures in a row, nothing wrong on our side).
    // Retry the configured model once, then try a separate-capacity model,
    // all inside the one existing timeout budget.
    const attempts: { model: string; delayMs: number }[] = [
      { model, delayMs: 0 },
      { model, delayMs: 1500 },
      ...(model !== FALLBACK_MODEL ? [{ model: FALLBACK_MODEL, delayMs: 1500 }] : []),
    ];
    const deadline = Date.now() + timeoutMs;

    const runAttempts = async () => {
      let lastErr: unknown;
      for (const attempt of attempts) {
        if (attempt.delayMs) await new Promise((r) => setTimeout(r, attempt.delayMs));
        if (Date.now() >= deadline) break;
        modelUsed = attempt.model;
        try {
          const aiModel = genAI.getGenerativeModel({
            model: attempt.model,
            generationConfig: { maxOutputTokens: maxTokens, temperature: 0.85 },
          });
          return await aiModel.generateContent(assembledPrompt);
        } catch (err) {
          lastErr = err;
          if (!isTransientAiError(err)) throw err;
        }
      }
      throw lastErr ?? new Error("Generation timed out");
    };

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Generation timed out")), timeoutMs)
    );

    const result = await Promise.race([runAttempts(), timeoutPromise]);
    outputText = (result.response.text() ?? "").trim();

    const usage = result.response.usageMetadata;
    inputTokens  = usage?.promptTokenCount     ?? Math.ceil(assembledPrompt.length / 4);
    outputTokens = usage?.candidatesTokenCount ?? Math.ceil(outputText.length / 4);

    if (!outputText) {
      throw new Error("Model returned empty output");
    }
  } catch (err: any) {
    Sentry.captureException(err, {
      tags: { feature: "social-promote", phase: "ai-generate" },
      extra: {
        authorId: req.authorId,
        platformId: req.platformId,
        promoTypeId: req.promoTypeId,
        contextType: req.contextType,
        model: modelUsed,
        inputTokens,
        outputTokens,
      },
    });
    const costMicroCents = calcCostMicroCents(modelUsed, inputTokens, outputTokens);
    const logged = await prisma.generatedSocialPost.create({
      data: {
        authorId:       req.authorId,
        platformId:     req.platformId,
        promoTypeId:    req.promoTypeId,
        contextType:    req.contextType,
        contextRefId:   req.contextRefId,
        contextSummary,
        promptUsed:     assembledPrompt,
        outputText:     "",
        modelUsed,
        inputTokens,
        outputTokens,
        costMicroCents,
        status:         "FAILED",
        errorMessage:   err?.message ?? "Unknown error",
        ipAddress:      req.ipAddress,
      },
    });
    return {
      ok: false, postId: logged.id, status: "FAILED",
      userMessage: isTransientAiError(err)
        ? "The AI service is very busy right now (on Google's side). Please try again in a minute — failed attempts don't count against your limit."
        : "Generation failed. Please try again in a moment.",
      errorDetail: err?.message ?? "Unknown error",
    };
  }

  const costMicroCents = calcCostMicroCents(modelUsed, inputTokens, outputTokens);
  const post = await prisma.generatedSocialPost.create({
    data: {
      authorId:       req.authorId,
      platformId:     req.platformId,
      promoTypeId:    req.promoTypeId,
      contextType:    req.contextType,
      contextRefId:   req.contextRefId,
      contextSummary,
      promptUsed:     assembledPrompt,
      outputText,
      modelUsed,
      inputTokens,
      outputTokens,
      costMicroCents,
      status:         "SUCCESS",
      ipAddress:      req.ipAddress,
    },
  });

  // Best-effort cost-ceiling check (fires warn or auto-disable email if a threshold was just crossed).
  // Never blocks the response — the gen itself already succeeded.
  await checkCostCeilingsAfterGen({ thisGenCostMicroCents: costMicroCents });

  return {
    ok: true,
    postId: post.id,
    outputText,
    assembledPrompt,
    inputTokens,
    outputTokens,
    costMicroCents,
    modelUsed,
  };
}
