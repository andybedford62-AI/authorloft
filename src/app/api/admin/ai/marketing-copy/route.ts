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

  const { bookTitle, genre, hook, channel } = await req.json();
  if (!bookTitle?.trim()) return NextResponse.json({ error: "Book title is required." }, { status: 400 });

  const channelKey = channel?.trim() || "Social Media";

  const prompt = `You are an expert book launch marketing copywriter. Draft compelling marketing copy for the following book launch.

Book Title: ${bookTitle.trim()}
Genre: ${genre?.trim() || "not specified"}
Core Hook / Tagline Idea: ${hook?.trim() || "none provided"}
Primary Channel: ${channelKey}

Please write:
1. A launch announcement post (${channelKey})
2. A short ad copy variant (under 50 words)
3. An email subject line + preview text
4. A call-to-action phrase

Use persuasive, authentic language suited to the channel. Do not add any preamble before item 1.`;

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
    console.error("[AI marketing-copy]", err);
    return NextResponse.json({ error: err?.message ?? "Generation failed. Please try again." }, { status: 500 });
  }
}
