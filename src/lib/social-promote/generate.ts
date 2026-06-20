import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";
import { calcCostMicroCents } from "./pricing";
import { assemblePrompt, type AssemblyInputs } from "./prompt-assembly";
import { checkCostCeilingsAfterGen } from "./cost-alerts";

export type GenerateRequest = {
  authorId:      string;
  platformId:    string;
  promoTypeId:   string;
  contextType:   "book" | "news" | "topic";
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

  try {
    const genAI  = new GoogleGenerativeAI(apiKey);
    const aiModel = genAI.getGenerativeModel({
      model,
      generationConfig: { maxOutputTokens: maxTokens, temperature: 0.85 },
    });

    const aiCall = aiModel.generateContent(assembledPrompt);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Generation timed out")), timeoutMs)
    );

    const result = await Promise.race([aiCall, timeoutPromise]);
    outputText = (result.response.text() ?? "").trim();

    const usage = result.response.usageMetadata;
    inputTokens  = usage?.promptTokenCount     ?? Math.ceil(assembledPrompt.length / 4);
    outputTokens = usage?.candidatesTokenCount ?? Math.ceil(outputText.length / 4);

    if (!outputText) {
      throw new Error("Model returned empty output");
    }
  } catch (err: any) {
    const costMicroCents = calcCostMicroCents(model, inputTokens, outputTokens);
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
        modelUsed:      model,
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
      userMessage: "Generation failed. Please try again in a moment.",
      errorDetail: err?.message ?? "Unknown error",
    };
  }

  const costMicroCents = calcCostMicroCents(model, inputTokens, outputTokens);
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
      modelUsed:      model,
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
    modelUsed: model,
  };
}
