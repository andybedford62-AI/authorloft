import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAiContext, incrementUsage } from "@/lib/ai-usage";
import { getAdminAuthorIdForApi } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const authorId = await getAdminAuthorIdForApi();
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getAiContext(authorId);
  if (!ctx) return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
  if (!ctx.planAllowed) {
    return NextResponse.json({ error: "AI features require a Premium plan. Upgrade to access AI tools." }, { status: 403 });
  }

  if (ctx.atLimit) {
    return NextResponse.json({
      error:   "limit_reached",
      message: `You've used all ${ctx.usageCap} free AI requests this month. Add your own Gemini API key in Settings to continue with no limits.`,
    }, { status: 402 });
  }

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content is required." }, { status: 400 });

  const prompt = `You are an SEO content analyst. Analyse the following content for keyword density and SEO effectiveness.

CONTENT:
${content.trim()}

Provide:
1. TOP KEYWORDS — list the top 10 most significant keywords/phrases with estimated density % and whether the density is Too Low / Good / Too High
2. MISSING KEYWORDS — important related terms that should be included
3. KEYWORD STUFFING WARNINGS — any phrases used excessively
4. READABILITY SCORE — estimate (Flesch-Kincaid level) and notes
5. CONTENT LENGTH — word count estimate and whether it meets SEO best practices
6. SPECIFIC RECOMMENDATIONS — 5 actionable improvements to boost keyword performance

Format each section clearly with uppercase labels. Do not add any preamble before item 1.`;

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
    console.error("[AI seo-keyword-density]", err);
    return NextResponse.json({ error: "AI analysis failed. Please try again in a moment." }, { status: 500 });
  }
}
