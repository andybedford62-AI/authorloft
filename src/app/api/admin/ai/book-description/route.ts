import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAiContext, incrementUsage } from "@/lib/ai-usage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getAiContext(authorId);
  if (!ctx) return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
  if (ctx.atLimit) {
    return NextResponse.json({
      error:   "limit_reached",
      message: `You've used all ${ctx.usageCap} free AI requests this month. Add your own Gemini API key in Settings to continue with no limits.`,
    }, { status: 402 });
  }

  const { bookTitle, genre, themes, audience } = await req.json();
  if (!bookTitle?.trim()) return NextResponse.json({ error: "Book title is required." }, { status: 400 });

  const prompt = [
    "You are a professional book marketing copywriter.",
    "Write compelling book marketing copy for the following book.\n",
    `Book Title: ${bookTitle.trim()}`,
    genre?.trim()    ? `Genre: ${genre.trim()}`              : null,
    themes?.trim()   ? `Key Themes: ${themes.trim()}`        : null,
    audience?.trim() ? `Target Audience: ${audience.trim()}` : null,
    "",
    "Please provide:",
    "1. A SHORT DESCRIPTION (2–3 sentences, for listings and previews)",
    "2. A FULL SYNOPSIS (2–3 paragraphs, engaging and spoiler-light)",
    "",
    "Use vivid, compelling language appropriate for the genre. Format clearly with headers.",
    "Do not add any preamble before the first header.",
  ].filter(Boolean).join("\n");

  try {
    const genAI  = new GoogleGenerativeAI(ctx.apiKey);
    const model  = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContentStream(prompt);

    if (!ctx.hasOwnKey) await incrementUsage(authorId);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" },
    });
  } catch (err: any) {
    console.error("[AI book-description]", err);
    return NextResponse.json({ error: err?.message ?? "Generation failed. Please try again." }, { status: 500 });
  }
}
