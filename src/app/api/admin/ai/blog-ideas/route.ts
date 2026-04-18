import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAiContext, incrementUsage } from "@/lib/ai-usage";

export async function POST(req: NextRequest) {
  const session  = await getServerSession(authOptions);
  const authorId = (session?.user as any)?.id as string | undefined;
  if (!authorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getAiContext(authorId);
  if (!ctx) return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
  if (ctx.atLimit) {
    return NextResponse.json({
      error:   "limit_reached",
      message: `You've used all ${ctx.usageCap} free AI requests this month. Add your own Gemini API key in Settings to continue with no limits.`,
    }, { status: 402 });
  }

  const { niche, audience, count } = await req.json();
  if (!niche?.trim()) return NextResponse.json({ error: "Author niche / genre is required." }, { status: 400 });

  const ideaCount = Math.min(Math.max(parseInt(count) || 5, 3), 10);

  const prompt = `You are a content strategist for authors and book publishers. Generate ${ideaCount} compelling blog post ideas for an author in the following niche.

Author Niche / Genre: ${niche.trim()}
Target Readership: ${audience?.trim() || "general readers"}

For each idea provide:
- A catchy title
- A 2-sentence outline of what the post would cover
- The primary goal (engage readers / SEO / community building / etc.)

Number each idea clearly. Do not add any preamble or closing commentary.`;

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
    console.error("[AI blog-ideas]", err);
    return NextResponse.json({ error: err?.message ?? "Generation failed. Please try again." }, { status: 500 });
  }
}
