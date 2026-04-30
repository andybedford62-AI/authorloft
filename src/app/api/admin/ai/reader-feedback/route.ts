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

  const { feedback } = await req.json();
  if (!feedback?.trim()) return NextResponse.json({ error: "Reader feedback is required." }, { status: 400 });

  const prompt = `You are a literary analyst and reader research specialist. Analyze the following reader feedback/reviews for an author's book.

READER FEEDBACK:
${feedback.trim()}

Please provide a structured analysis:

1. OVERALL SENTIMENT — Positive / Mixed / Negative with a brief summary
2. TOP PRAISE THEMES — What readers consistently loved (bullet points)
3. TOP CRITICISM THEMES — Recurring concerns or complaints (bullet points)
4. EMOTIONAL RESPONSE — How readers felt (engaged, emotional, confused, etc.)
5. ACTIONABLE INSIGHTS — 3 concrete suggestions the author can act on for future books or marketing

Be concise and specific. Quote short phrases from the feedback where relevant. Do not add any preamble before item 1.`;

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
    console.error("[AI reader-feedback]", err);
    return NextResponse.json({ error: "AI generation failed. Please try again in a moment." }, { status: 500 });
  }
}
