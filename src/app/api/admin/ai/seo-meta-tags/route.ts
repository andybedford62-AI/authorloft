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

  const { mode, title, content, keywords } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const prompt = `You are an SEO specialist for author websites. Generate optimised SEO meta tags for the following page.

Page Type: ${mode === "book" ? "Book Listing Page" : "Author / Custom Page"}
Title: ${title.trim()}
Content Summary: ${content?.trim() || "Not provided"}
Target Keywords: ${keywords?.trim() || "not specified"}

Provide:
1. SEO TITLE TAG — compelling, under 60 characters, includes primary keyword
2. META DESCRIPTION — enticing summary, 150–160 characters, includes CTA and keyword
3. OG TITLE — for social sharing (can be slightly longer)
4. OG DESCRIPTION — for social sharing, 1–2 punchy sentences
5. SUGGESTED KEYWORDS — 8–10 relevant keywords/phrases
6. SEO SCORE NOTES — brief commentary on what's strong and what to improve

Format each section clearly with the label in uppercase. Do not add any preamble before item 1.`;

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
    console.error("[AI seo-meta-tags]", err);
    return NextResponse.json({ error: err?.message ?? "Generation failed. Please try again." }, { status: 500 });
  }
}
