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

  const { focusPage, books } = await req.json();
  if (!focusPage?.trim()) return NextResponse.json({ error: "Page description is required." }, { status: 400 });

  const bookList = Array.isArray(books) && books.length > 0
    ? books.map((b: { title: string; slug: string }) => `- "${b.title}" at /books/${b.slug}`).join("\n")
    : "No books available";

  const prompt = `You are an SEO internal linking strategist for an author website. Suggest smart internal linking opportunities.

CURRENT PAGE / CONTEXT:
${focusPage.trim()}

AVAILABLE PAGES ON THIS SITE:
Standard Pages: Home (/), Books (/books), About (/about), Blog (/blog), Contact (/contact)

Book Pages:
${bookList}

TASK:
1. LINKING OPPORTUNITIES — for each suggestion, provide:
   - Anchor text (the clickable words)
   - Target URL
   - Where on the source page to place it
   - SEO rationale (1 sentence)

2. CONTENT CLUSTERS — suggest 2–3 topic clusters that could be built out with internal links

3. PRIORITY ORDER — rank the top 5 most impactful links to add first

Be specific and practical. Do not add any preamble before item 1.`;

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
    console.error("[AI seo-internal-links]", err);
    return NextResponse.json({ error: err?.message ?? "Generation failed. Please try again." }, { status: 500 });
  }
}
